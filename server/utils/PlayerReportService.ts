import { v4 as uuid } from 'uuid';
import { logger } from '../logger';
import { closedPlayerReportGsiKey, getDynamoDbServiceAsync, OPEN_PLAYER_REPORT_GSI_KEY, playerReportLogExpiryGsiKey } from '../services/DynamoDBService';
import type {
    IActiveModActionCacheEntry,
    IModActionEntity,
    IPlayerReportEntity,
    IPlayerReportIndexEntity,
    IPlayerReportLogEntity,
    IPlayerReportLogLine,
    IUsernameChangeEntity
} from '../services/DynamoDBInterfaces';
import {
    PlayerReportLogKind,
    PlayerReportOutcome,
    PlayerReportRole,
    PlayerReportStatus
} from '../services/DynamoDBInterfaces';
import type { ISerializedMessage } from '../game/Interfaces';
import { DiscordDispatcher } from '../gamenode/DiscordDispatcher';
import type { UserFactory } from './user/UserFactory';
import type { ModActionService } from './ModActionService';
import { addDays, dayOf, lastExpiredMonth, monthOf, nextMonth, previousMonth } from './RetentionBuckets';
import type { IScheduler } from './IScheduler';
import { RealScheduler } from './RealScheduler';
import type { IPlayerReportListQuery, IPlayerReportPage } from './PlayerReportListCache';
import { PlayerReportListCache } from './PlayerReportListCache';

export interface IReportParticipant {
    id: string;
    username: string;
}

export interface INewPlayerReport {
    reporter: IReportParticipant;
    reportedPlayer: IReportParticipant;
    offense: string;
    description: string;
    lobbyId: string;
    gameId?: string;
    gameFormat: string;
    matchType: string;
    gameStepsSinceLastUndo?: number;
    gameMessages: ISerializedMessage[];
    chatMessages: ISerializedMessage[];
}

/** Everything a moderator needs to judge one side of a report */
export interface IPlayerReportPlayerContext {
    playerId: string;

    /** Current username; the report keeps the name at report time */
    username: string;
    createdAt?: string;
    isMuted: boolean;
    activeRename: IActiveModActionCacheEntry | null;

    /** Id of the active ReportingDisabled mod action, if the player may currently not file reports */
    activeReportingDisabledId: string | null;

    /** Id of the active UsernameChangesBlocked mod action, if the player may currently not rename themselves */
    activeUsernameChangesBlockedId: string | null;
    modActions: IModActionEntity[];

    /** Past usernames, newest first; the main evidence for offensive-username reports */
    usernameChanges: IUsernameChangeEntity[];
    reportsAgainst: IPlayerReportIndexEntity[];
    reportsFiled: IPlayerReportIndexEntity[];
}

export interface IPlayerReportDetail {
    report: IPlayerReportEntity;
    chatLog: IPlayerReportLogEntity | null;
    gameLog: IPlayerReportLogEntity | null;
    reporter: IPlayerReportPlayerContext;
    reportedPlayer: IPlayerReportPlayerContext;

    /** Mod actions issued from this ticket, against either player */
    ticketActions: IModActionEntity[];
}

export type PlayerReportUpdateResult =
  | { success: true; report: IPlayerReportEntity }
  | { success: false; reason: 'notFound' | 'conflict'; message: string };

export interface IRetentionCleanupResult {
    logsDeleted: number;
    reportsDeleted: number;
}

export interface IModerator {
    id: string;
    username: string;
}

/** The state a moderator puts a report into */
export type PlayerReportStatusUpdate =
  | { status: PlayerReportStatus.Closed; outcome: PlayerReportOutcome; closingNote?: string }
  | { status: PlayerReportStatus.Open };

/** Why a mod action may not be issued from a report ticket */
export type ReportActionTargetError = 'notFound' | 'notParticipant' | 'closed';

/**
 * Stores player reports in DynamoDB and serves them to the mod tools, replacing the
 * Discord channel the reports used to be posted to.
 */
export class PlayerReportService {
    /** Player reports were first stored in this month, so no report bucket is older */
    public static readonly FirstReportMonth = '2026-10';

    /**
     * Chat and game logs are deleted this many days after a ticket is closed, by the first weekly cleanup after
     * that, so 30 to 37 days after closing. Stated in the Terms (Privacy & Data Use); change both together.
     */
    public static readonly LogRetentionDays = 30;

    /** Closed reports (without logs) are kept at least this many months for repeat-offender history */
    public static readonly MetadataRetentionMonths = 12;

    /** The retention cleanup runs once a week, on this UTC weekday (0 = Sunday) and hour */
    public static readonly CleanupWeekdayUtc = 0;
    public static readonly CleanupHourUtc = 3;
    private static readonly WeekMs = 7 * 24 * 60 * 60 * 1000;

    /** After a start, a cleanup that is overdue (e.g. the node was down at the weekly time) runs after this delay */
    public static readonly OverdueCleanupDelayMs = 10 * 60 * 1000;

    /** False reports filed within this many days are counted on a new report from the same player */
    public static readonly RecentFalseReportDays = 30;

    /** How long the report list is served from memory before it is read from DynamoDB again */
    public static readonly ListCacheMaxAgeMs = 10 * 60 * 1000;

    /** Close/reopen tries before giving up when the report keeps changing underneath */
    private static readonly TransitionAttempts = 3;

    /**
     * DynamoDB items are capped at 400 KB; keep each log well below that. Both logs together must also stay below
     * 1 MB, the size of the single query page getPlayerReportAsync reads the logs with.
     */
    private static readonly MaxLogBytes = 300_000;
    private static readonly MaxLogLineLength = 2000;
    private static readonly MaxDescriptionLength = 2000;

    private readonly dbServicePromise = getDynamoDbServiceAsync();
    private readonly listCache: PlayerReportListCache;

    /** For the moderator endpoints: without DynamoDB there are no reports, which is an error, not an empty list */
    private async requireDbServiceAsync() {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            throw new Error('Player reports are unavailable: DynamoDB service unavailable');
        }
        return dbService;
    }

    public constructor(
        private readonly userFactory: UserFactory,
        private readonly getModActionService: () => ModActionService | undefined,
        private readonly scheduler: IScheduler = new RealScheduler(),
    ) {
        this.listCache = new PlayerReportListCache(
            () => this.loadAllReportsAsync(),
            () => this.scheduler.currentDate(),
            PlayerReportService.ListCacheMaxAgeMs
        );
    }

    private now(): Date {
        return this.scheduler.currentDate();
    }

    // ==================== Creating ====================

    public async createReportAsync(input: INewPlayerReport): Promise<IPlayerReportEntity> {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            throw new Error('Player reports cannot be stored: DynamoDB service unavailable');
        }

        const [reportedIndex, reporterIndex] = await Promise.all([
            dbService.getPlayerReportIndexAsync(input.reportedPlayer.id),
            dbService.getPlayerReportIndexAsync(input.reporter.id),
        ]);

        const createdAt = this.now();
        const recentSince = new Date(createdAt.getTime() - PlayerReportService.RecentFalseReportDays * 24 * 60 * 60 * 1000).toISOString();
        const report: IPlayerReportEntity = {
            id: uuid(),
            createdAt: createdAt.toISOString(),
            status: PlayerReportStatus.Open,
            reporterId: input.reporter.id,
            reporterUsername: input.reporter.username,
            reportedPlayerId: input.reportedPlayer.id,
            reportedPlayerUsername: input.reportedPlayer.username,
            offense: input.offense,
            description: PlayerReportService.cleanText(input.description, PlayerReportService.MaxDescriptionLength),
            lobbyId: input.lobbyId,
            // Game.id is typed as a string but holds a number at runtime; store it consistently as text
            gameId: input.gameId != null ? String(input.gameId) : undefined,
            gameFormat: input.gameFormat,
            matchType: input.matchType,
            gameStepsSinceLastUndo: input.gameStepsSinceLastUndo,
            reportedPlayerPriorReportCount: reportedIndex.filter((entry) => entry.role === PlayerReportRole.ReportedPlayer).length,
            reporterRecentFalseReportCount: reporterIndex.filter((entry) =>
                entry.role === PlayerReportRole.ReportSubmitter &&
                entry.outcome === PlayerReportOutcome.FalseReport &&
                entry.createdAt >= recentSince
            ).length,
        };

        const logs = [
            this.buildLog(report.id, PlayerReportLogKind.Chat, input.chatMessages, input.reporter, input.reportedPlayer),
            this.buildLog(report.id, PlayerReportLogKind.Game, input.gameMessages, input.reporter, input.reportedPlayer),
        ];

        const sharedIndexFields = {
            reportId: report.id,
            createdAt: report.createdAt,
            offense: report.offense,
            status: report.status,
            lobbyId: report.lobbyId,
            gameId: report.gameId,
        };
        const indexEntries: IPlayerReportIndexEntity[] = [
            { ...sharedIndexFields, playerId: report.reporterId, role: PlayerReportRole.ReportSubmitter },
            { ...sharedIndexFields, playerId: report.reportedPlayerId, role: PlayerReportRole.ReportedPlayer },
        ];

        await dbService.savePlayerReportAsync(report, logs, indexEntries);
        this.listCache.upsert(report);

        logger.info(`PlayerReportService: Stored player report ${report.id}`, {
            reportId: report.id,
            reporterId: report.reporterId,
            reportedPlayerId: report.reportedPlayerId,
            lobbyId: report.lobbyId,
        });

        return report;
    }

    // ==================== Reading ====================

    /**
     * One page of the report list in the requested order, served from memory.
     * @throws InvalidReportCursorError for a cursor this service did not hand out
     */
    public listReportsAsync(query: IPlayerReportListQuery): Promise<IPlayerReportPage> {
        return this.listCache.queryAsync(query);
    }

    public getOpenReportCountAsync(): Promise<number> {
        return this.listCache.countOpenAsync();
    }

    /** Every stored report record: the open ones and those of every closed-month bucket the cleanup has not deleted */
    private async loadAllReportsAsync(): Promise<IPlayerReportEntity[]> {
        const dbService = await this.requireDbServiceAsync();
        const now = this.now();

        // Older buckets are gone once the cleanup has run; the newest deletable one may still be waiting for it
        const oldestKeptMonth = lastExpiredMonth(now, PlayerReportService.MetadataRetentionMonths);
        const keys = [OPEN_PLAYER_REPORT_GSI_KEY];
        for (let month = monthOf(now); month >= PlayerReportService.FirstReportMonth && month >= oldestKeptMonth; month = previousMonth(month)) {
            keys.push(closedPlayerReportGsiKey(month));
        }

        const buckets = await Promise.all(keys.map((key) => dbService.getPlayerReportsByGsiKeyAsync(key)));
        return buckets.flat();
    }

    public async getReportDetailAsync(reportId: string): Promise<IPlayerReportDetail | null> {
        const dbService = await this.requireDbServiceAsync();
        const stored = await dbService.getPlayerReportAsync(reportId);
        if (!stored) {
            return null;
        }

        const { report, logs } = stored;
        // Not a consistent read, so this copy may be older than the cached one (the FE reloads a ticket right after
        // closing or reopening it); it only fills in a report this process has not seen yet
        this.listCache.addIfMissing(report);
        const [reporter, reportedPlayer] = await Promise.all([
            this.getPlayerContextAsync(report.reporterId, report.reporterUsername),
            this.getPlayerContextAsync(report.reportedPlayerId, report.reportedPlayerUsername),
        ]);

        const ticketActions = [...reporter.modActions, ...reportedPlayer.modActions]
            .filter((action) => action.relatedReportId === report.id)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        return {
            report,
            chatLog: logs.find((log) => log.kind === PlayerReportLogKind.Chat) ?? null,
            gameLog: logs.find((log) => log.kind === PlayerReportLogKind.Game) ?? null,
            reporter,
            reportedPlayer,
            ticketActions,
        };
    }

    /**
     * Whether a mod action against `playerId` may be issued from the given ticket: only against one of its two
     * players, and only while it is open. Reads just the report record, not its logs.
     * @returns null if the action is allowed
     */
    public async getActionTargetErrorAsync(reportId: string, playerId: string): Promise<ReportActionTargetError | null> {
        const dbService = await this.requireDbServiceAsync();
        const report = await dbService.getPlayerReportMetaAsync(reportId);
        if (!report) {
            return 'notFound';
        }
        if (report.reporterId !== playerId && report.reportedPlayerId !== playerId) {
            return 'notParticipant';
        }
        return report.status === PlayerReportStatus.Open ? null : 'closed';
    }

    // ==================== Ticket workflow ====================

    /** Closes the report with an outcome, or opens it again */
    public updateStatusAsync(reportId: string, update: PlayerReportStatusUpdate, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        return update.status === PlayerReportStatus.Closed
            ? this.closeReportAsync(reportId, update.outcome, update.closingNote, moderator)
            : this.reopenReportAsync(reportId, moderator);
    }

    public async closeReportAsync(reportId: string, outcome: PlayerReportOutcome, closingNote: string | undefined, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        const closedAt = this.now().toISOString();
        const set: Partial<IPlayerReportEntity> = {
            status: PlayerReportStatus.Closed,
            closedAt,
            closedById: moderator.id,
            closedByUsername: moderator.username,
            outcome,
        };
        const trimmedNote = closingNote?.trim();
        if (trimmedNote) {
            set.closingNote = trimmedNote;
        }

        const result = await this.transitionAsync(
            reportId,
            PlayerReportStatus.Open,
            set,
            trimmedNote ? [] : ['closingNote'],
            closedPlayerReportGsiKey(monthOf(new Date(closedAt))),
            playerReportLogExpiryGsiKey(PlayerReportService.logExpiryDay(closedAt))
        );
        if (result.success) {
            logger.info(`PlayerReportService: Moderator ${moderator.username} closed report ${reportId} as ${outcome}`, { reportId, outcome });
        }
        return result;
    }

    public async reopenReportAsync(reportId: string, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        const result = await this.transitionAsync(
            reportId,
            PlayerReportStatus.Closed,
            {
                status: PlayerReportStatus.Open,
                reopenedAt: this.now().toISOString(),
                reopenedByUsername: moderator.username,
            },
            ['closedAt', 'closedById', 'closedByUsername', 'outcome', 'closingNote'],
            OPEN_PLAYER_REPORT_GSI_KEY,
            null
        );
        if (result.success) {
            logger.info(`PlayerReportService: Moderator ${moderator.username} reopened report ${reportId}`, { reportId });
        }
        return result;
    }

    // ==================== Retention ====================

    /**
     * Deletes logs of tickets closed more than LogRetentionDays ago and whole reports closed more than
     * MetadataRetentionMonths ago. Expired items are found through their day/month GSI buckets.
     *
     * A failure on one report is logged and the cleanup carries on with the others; the cursor then stops
     * before the first bucket that had a failure, so the next weekly run retries it.
     */
    public async runRetentionCleanupAsync(now: Date = this.now()): Promise<IRetentionCleanupResult> {
        const dbService = await this.dbServicePromise;
        if (!dbService) {
            return { logsDeleted: 0, reportsDeleted: 0 };
        }

        const cursor = await dbService.getPlayerReportCleanupCursorAsync() ?? {
            lastLogDay: addDays(`${PlayerReportService.FirstReportMonth}-01`, -1),
            lastMetadataMonth: previousMonth(PlayerReportService.FirstReportMonth),
        };
        const deletedAt = now.toISOString();

        // Only buckets for days before today, so logs are always kept for at least LogRetentionDays
        const lastLogDay = addDays(dayOf(now), -1);
        // A ticket in bucket `day` was closed on day - LogRetentionDays; one closed later (after a reopen) is not due
        const logsClosedBefore = `${addDays(lastLogDay, 1 - PlayerReportService.LogRetentionDays)}T00:00:00.000Z`;
        let logsDeleted = 0;
        let logCursor = cursor.lastLogDay;
        let logFailure = false;
        for (let day = addDays(cursor.lastLogDay, 1); day <= lastLogDay; day = addDays(day, 1)) {
            const logs = await this.queryBucketAsync(`log expiry bucket ${day}`, () =>
                dbService.queryAttributesByGsiAsync(playerReportLogExpiryGsiKey(day), ['reportId']));
            if (!logs) {
                logFailure = true;
                continue;
            }
            for (const reportId of new Set(logs.map((log) => log.reportId as string))) {
                const outcome = await this.cleanUpOneAsync(`logs of report ${reportId}`, () =>
                    dbService.deletePlayerReportLogsAsync(reportId, deletedAt, logsClosedBefore));
                if (outcome === 'deleted') {
                    logsDeleted++;
                    this.listCache.patch(reportId, { logsDeletedAt: deletedAt });
                }
                logFailure ||= outcome === 'failed';
            }
            if (!logFailure) {
                logCursor = day;
            }
        }

        // A month bucket is deleted once every report in it is at least MetadataRetentionMonths old
        const lastMetadataMonth = lastExpiredMonth(now, PlayerReportService.MetadataRetentionMonths);
        const reportsClosedBefore = `${nextMonth(lastMetadataMonth)}-01T00:00:00.000Z`;
        let reportsDeleted = 0;
        let metadataCursor = cursor.lastMetadataMonth;
        let metadataFailure = false;
        for (let month = nextMonth(cursor.lastMetadataMonth); month <= lastMetadataMonth; month = nextMonth(month)) {
            const reports = await this.queryBucketAsync(`closed report bucket ${month}`, () =>
                dbService.queryAttributesByGsiAsync(closedPlayerReportGsiKey(month), ['id', 'reporterId', 'reportedPlayerId']));
            if (!reports) {
                metadataFailure = true;
                continue;
            }
            for (const report of reports) {
                const outcome = await this.cleanUpOneAsync(`report ${report.id}`, () =>
                    dbService.deletePlayerReportAsync(report.id, report.reporterId, report.reportedPlayerId, reportsClosedBefore));
                if (outcome === 'deleted') {
                    reportsDeleted++;
                    this.listCache.remove(report.id);
                }
                metadataFailure ||= outcome === 'failed';
            }
            if (!metadataFailure) {
                metadataCursor = month;
            }
        }

        await dbService.savePlayerReportCleanupCursorAsync({ lastLogDay: logCursor, lastMetadataMonth: metadataCursor, lastRunAt: deletedAt });

        if (logsDeleted > 0 || reportsDeleted > 0) {
            logger.info(`PlayerReportService: Retention cleanup deleted logs of ${logsDeleted} reports and ${reportsDeleted} reports`);
        }
        return { logsDeleted, reportsDeleted };
    }

    /**
     * Runs the retention cleanup every week at the fixed time (CleanupWeekdayUtc, CleanupHourUtc). Shortly after
     * the start it also runs once if the last run is more than a week ago, so restarts cannot keep skipping it.
     * Call once, when the server starts.
     */
    public scheduleRetentionCleanup(): void {
        const errorContext = { message: 'PlayerReportService: error during the retention cleanup' };

        this.scheduler.setTimeout(async () => {
            const dbService = await this.dbServicePromise;
            const cursor = await dbService?.getPlayerReportCleanupCursorAsync();
            const lastRunAt = cursor?.lastRunAt ? new Date(cursor.lastRunAt).getTime() : 0;
            if (dbService && this.now().getTime() - lastRunAt >= PlayerReportService.WeekMs) {
                await this.runRetentionCleanupAsync();
            }
        }, PlayerReportService.OverdueCleanupDelayMs, errorContext);

        const scheduleNextWeeklyRun = () => {
            const delayMs = PlayerReportService.nextWeeklyCleanup(this.now()).getTime() - this.now().getTime();
            this.scheduler.setTimeout(async () => {
                scheduleNextWeeklyRun();
                await this.runRetentionCleanupAsync();
            }, delayMs, errorContext);
        };
        scheduleNextWeeklyRun();
    }

    /** The first weekly cleanup time strictly after `now` */
    public static nextWeeklyCleanup(now: Date): Date {
        const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), PlayerReportService.CleanupHourUtc));
        next.setUTCDate(next.getUTCDate() + ((PlayerReportService.CleanupWeekdayUtc - next.getUTCDay() + 7) % 7));
        if (next <= now) {
            next.setUTCDate(next.getUTCDate() + 7);
        }
        return next;
    }

    /** @returns null if the bucket could not be read; the cleanup then retries it on the next run */
    private async queryBucketAsync(label: string, queryAsync: () => Promise<Record<string, any>[]>): Promise<Record<string, any>[] | null> {
        try {
            return await queryAsync();
        } catch (error) {
            logger.error(`PlayerReportService: Retention cleanup could not read the ${label}, it is retried on the next run`, {
                error: { message: error?.message, stack: error?.stack },
            });
            return null;
        }
    }

    private async cleanUpOneAsync(label: string, deleteAsync: () => Promise<boolean>): Promise<'deleted' | 'skipped' | 'failed'> {
        try {
            return await deleteAsync() ? 'deleted' : 'skipped';
        } catch (error) {
            logger.error(`PlayerReportService: Retention cleanup failed for ${label}, it is retried on the next run`, {
                error: { message: error?.message, stack: error?.stack },
            });
            return 'failed';
        }
    }

    /** YYYY-MM-DD bucket on which the logs of a ticket closed at `closedAt` expire */
    public static logExpiryDay(closedAt: string): string {
        return addDays(dayOf(new Date(closedAt)), PlayerReportService.LogRetentionDays);
    }

    // ==================== Helpers ====================

    /**
     * Close or reopen: the report, both players' index entries and the logs' expiry change together (see
     * DynamoDBService.transitionPlayerReportAsync). If anything changed between reading the report and writing
     * the transition (another moderator, the retention cleanup), it is evaluated again on fresh data.
     */
    private async transitionAsync(
        reportId: string,
        expectedStatus: PlayerReportStatus,
        set: Partial<IPlayerReportEntity>,
        remove: (keyof IPlayerReportEntity)[],
        gsiKey: string,
        logExpiryGsiKey: string | null,
    ): Promise<PlayerReportUpdateResult> {
        const dbService = await this.requireDbServiceAsync();
        for (let attempt = 1; attempt <= PlayerReportService.TransitionAttempts; attempt++) {
            // Consistent, so a retry sees what made the previous attempt fail
            const stored = await dbService.getPlayerReportAsync(reportId, { consistentRead: true });
            if (!stored) {
                return { success: false, reason: 'notFound', message: 'Report not found' };
            }
            if (stored.report.status !== expectedStatus) {
                return { success: false, reason: 'conflict', message: `Report is already ${stored.report.status.toLowerCase()}` };
            }

            const result = await dbService.transitionPlayerReportAsync(stored.report, expectedStatus, set, remove, gsiKey, logExpiryGsiKey);
            if ('report' in result) {
                this.listCache.upsert(result.report);
                return { success: true, report: result.report };
            }
            logger.info(`PlayerReportService: Report ${reportId} changed during its status update (${result.reason}), attempt ${attempt}`, { reportId });
        }

        return { success: false, reason: 'conflict', message: 'The report kept changing while it was being updated. Please try again.' };
    }

    private async getPlayerContextAsync(playerId: string, usernameAtReport: string): Promise<IPlayerReportPlayerContext> {
        const dbService = await this.requireDbServiceAsync();
        const modActionService = this.getModActionService();

        const [profile, modActions, usernameChanges, reportIndex] = await Promise.all([
            dbService.getUserProfileAsync(playerId),
            this.userFactory.getModActionHistoryAsync(playerId),
            this.userFactory.getUsernameChangeHistoryAsync(playerId),
            dbService.getPlayerReportIndexAsync(playerId),
        ]);

        const newestFirst = (a: IPlayerReportIndexEntity, b: IPlayerReportIndexEntity) => b.createdAt.localeCompare(a.createdAt);

        return {
            playerId,
            username: profile?.username ?? usernameAtReport,
            createdAt: profile?.createdAt,
            isMuted: modActionService?.isPlayerMuted(playerId) ?? false,
            activeRename: modActionService?.playerActiveRename(playerId) ?? null,
            activeReportingDisabledId: modActionService?.getActiveReportingDisabledActionId(playerId) ?? null,
            activeUsernameChangesBlockedId: modActionService?.getActiveUsernameChangesBlockedActionId(playerId) ?? null,
            modActions,
            usernameChanges,
            reportsAgainst: reportIndex.filter((entry) => entry.role === PlayerReportRole.ReportedPlayer).sort(newestFirst),
            reportsFiled: reportIndex.filter((entry) => entry.role === PlayerReportRole.ReportSubmitter).sort(newestFirst),
        };
    }

    private buildLog(
        reportId: string,
        kind: PlayerReportLogKind,
        messages: ISerializedMessage[],
        reporter: IReportParticipant,
        reportedPlayer: IReportParticipant,
    ): IPlayerReportLogEntity {
        const lines: IPlayerReportLogLine[] = (messages ?? []).map((entry) => ({
            at: this.toIsoDate(entry.date),
            playerIds: PlayerReportService.collectPlayerIds(entry),
            text: PlayerReportService.cleanText(
                DiscordDispatcher.formatMessageToText(entry, reporter.id, reportedPlayer.id, reporter.username, reportedPlayer.username),
                PlayerReportService.MaxLogLineLength
            ),
        }));

        // Keep the newest lines: they are closest to the moment the report was filed
        let truncated = false;
        let size = Buffer.byteLength(JSON.stringify(lines));
        while (lines.length > 0 && size > PlayerReportService.MaxLogBytes) {
            const dropped = lines.shift();
            size -= Buffer.byteLength(JSON.stringify(dropped)) + 1;
            truncated = true;
        }

        return { reportId, kind, lines, truncated };
    }

    /** Ids of the players a message refers to; for chat lines this is the speaker */
    private static collectPlayerIds(entry: ISerializedMessage): string[] {
        const message = entry.message;
        if (!Array.isArray(message)) {
            return [];
        }

        const ids = new Set<string>();
        for (const part of message as unknown[]) {
            if (part && typeof part === 'object' && 'id' in part && typeof part.id === 'string') {
                ids.add(part.id);
            }
        }
        return [...ids];
    }

    private static cleanText(text: string, maxLength: number): string {
        // eslint-disable-next-line no-control-regex
        const cleaned = (text ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
        return cleaned.length > maxLength ? `${cleaned.substring(0, maxLength - 3)}...` : cleaned;
    }

    private toIsoDate(value: Date | string): string {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? this.now().toISOString() : date.toISOString();
    }
}
