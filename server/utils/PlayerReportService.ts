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
import { DiscordDispatcher } from '../game/core/DiscordDispatcher';
import type { UserFactory } from './user/UserFactory';
import type { ModActionService } from './ModActionService';
import { addDays, dayOf, lastExpiredMonth, monthOf, nextMonth, previousMonth } from './RetentionBuckets';

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
    screenResolution?: { width: number; height: number } | null;
    viewport?: { width: number; height: number } | null;
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

export interface IClosedPlayerReportPage {
    reports: IPlayerReportEntity[];

    /** Pass as `beforeMonth` to load older reports; null when there is nothing older */
    nextBeforeMonth: string | null;
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

/**
 * Stores player reports in DynamoDB and serves them to the mod tools, replacing the
 * Discord channel the reports used to be posted to.
 */
export class PlayerReportService {
    /** Player reports were first stored in this month, so closed-report paging stops here */
    public static readonly FirstReportMonth = '2026-10';

    /** Chat and game logs are deleted this many days after a ticket is closed */
    public static readonly LogRetentionDays = 30;

    /** Closed reports (without logs) are kept at least this many months for repeat-offender history */
    public static readonly MetadataRetentionMonths = 12;

    /** How often the backend runs the retention cleanup */
    public static readonly CleanupIntervalMs = 6 * 60 * 60 * 1000;

    /** Close/reopen tries before giving up when the report keeps changing underneath */
    private static readonly TransitionAttempts = 3;

    /** Months scanned per closed-report page */
    private static readonly ClosedMonthsPerPage = 3;

    /**
     * DynamoDB items are capped at 400 KB; keep each log well below that. Both logs together must also stay below
     * 1 MB: getPlayerReportAsync reads a report's items in a single query page, and META sorts after the logs.
     */
    private static readonly MaxLogBytes = 300_000;
    private static readonly MaxLogLineLength = 2000;
    private static readonly MaxDescriptionLength = 2000;

    private readonly dbServicePromise = getDynamoDbServiceAsync();

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
    ) {}

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

        const report: IPlayerReportEntity = {
            id: uuid(),
            createdAt: new Date().toISOString(),
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
            screenResolution: input.screenResolution ?? undefined,
            viewport: input.viewport ?? undefined,
            reportedPlayerPriorReportCount: reportedIndex.filter((entry) => entry.role === PlayerReportRole.Reported).length,
            reporterPriorFalseReportCount: reporterIndex.filter(
                (entry) => entry.role === PlayerReportRole.Reporter && entry.outcome === PlayerReportOutcome.FalseReport
            ).length,
        };

        const logs = [
            this.buildLog(report.id, PlayerReportLogKind.Chat, input.chatMessages, input.reporter, input.reportedPlayer),
            this.buildLog(report.id, PlayerReportLogKind.Game, input.gameMessages, input.reporter, input.reportedPlayer),
        ];

        const indexEntries: IPlayerReportIndexEntity[] = [
            { reportId: report.id, playerId: report.reporterId, role: PlayerReportRole.Reporter, createdAt: report.createdAt, offense: report.offense, status: report.status },
            { reportId: report.id, playerId: report.reportedPlayerId, role: PlayerReportRole.Reported, createdAt: report.createdAt, offense: report.offense, status: report.status },
        ];

        await dbService.savePlayerReportAsync(report, logs, indexEntries);

        logger.info(`PlayerReportService: Stored player report ${report.id}`, {
            reportId: report.id,
            reporterId: report.reporterId,
            reportedPlayerId: report.reportedPlayerId,
            lobbyId: report.lobbyId,
        });

        return report;
    }

    // ==================== Reading ====================

    /** All open reports, oldest first */
    public async getOpenReportsAsync(): Promise<IPlayerReportEntity[]> {
        const dbService = await this.requireDbServiceAsync();
        const reports = await dbService.getPlayerReportsByGsiKeyAsync(OPEN_PLAYER_REPORT_GSI_KEY);
        return reports.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Closed reports, newest first, a few months at a time.
     * @param beforeMonth YYYY-MM month to continue from (exclusive); omitted for the current month
     */
    public async getClosedReportsAsync(beforeMonth?: string): Promise<IClosedPlayerReportPage> {
        const dbService = await this.requireDbServiceAsync();

        let month = beforeMonth
            ? previousMonth(beforeMonth)
            : monthOf(new Date());
        const reports: IPlayerReportEntity[] = [];
        let scanned = 0;

        while (month >= PlayerReportService.FirstReportMonth && scanned < PlayerReportService.ClosedMonthsPerPage) {
            reports.push(...await dbService.getPlayerReportsByGsiKeyAsync(closedPlayerReportGsiKey(month)));
            scanned++;
            month = previousMonth(month);
        }

        reports.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));

        // `month` is now the next unscanned month; the cursor is exclusive, so hand back the month after it
        const hasOlder = month >= PlayerReportService.FirstReportMonth;
        return { reports, nextBeforeMonth: hasOlder ? nextMonth(month) : null };
    }

    public async getOpenReportCountAsync(): Promise<number> {
        return (await this.getOpenReportsAsync()).length;
    }

    public async getReportDetailAsync(reportId: string): Promise<IPlayerReportDetail | null> {
        const dbService = await this.requireDbServiceAsync();
        const stored = await dbService.getPlayerReportAsync(reportId);
        if (!stored) {
            return null;
        }

        const { report, logs } = stored;
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

    /** True if the player is the reporter or the reported player of the given report */
    public async isParticipantAsync(reportId: string, playerId: string): Promise<boolean> {
        const dbService = await this.requireDbServiceAsync();
        const stored = await dbService.getPlayerReportAsync(reportId);
        return !!stored && (stored.report.reporterId === playerId || stored.report.reportedPlayerId === playerId);
    }

    // ==================== Ticket workflow ====================

    /** Take over an open report. Another moderator's claim is replaced. */
    public claimReportAsync(reportId: string, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        return this.updateAsync(reportId, PlayerReportStatus.Open, {
            claimedById: moderator.id,
            claimedByUsername: moderator.username,
            claimedAt: new Date().toISOString(),
        });
    }

    public async closeReportAsync(reportId: string, outcome: PlayerReportOutcome, closingNote: string | undefined, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        const closedAt = new Date().toISOString();
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
        const now = new Date().toISOString();
        const result = await this.transitionAsync(
            reportId,
            PlayerReportStatus.Closed,
            {
                status: PlayerReportStatus.Open,
                reopenedAt: now,
                reopenedByUsername: moderator.username,
                claimedById: moderator.id,
                claimedByUsername: moderator.username,
                claimedAt: now,
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
     * before the first bucket that had a failure, so the next run (every CleanupIntervalMs) retries it.
     */
    public async runRetentionCleanupAsync(now: Date = new Date()): Promise<IRetentionCleanupResult> {
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
                logsDeleted += outcome === 'deleted' ? 1 : 0;
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
                reportsDeleted += outcome === 'deleted' ? 1 : 0;
                metadataFailure ||= outcome === 'failed';
            }
            if (!metadataFailure) {
                metadataCursor = month;
            }
        }

        if (logCursor !== cursor.lastLogDay || metadataCursor !== cursor.lastMetadataMonth) {
            await dbService.savePlayerReportCleanupCursorAsync({ lastLogDay: logCursor, lastMetadataMonth: metadataCursor });
        }

        if (logsDeleted > 0 || reportsDeleted > 0) {
            logger.info(`PlayerReportService: Retention cleanup deleted logs of ${logsDeleted} reports and ${reportsDeleted} reports`);
        }
        return { logsDeleted, reportsDeleted };
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

    private async updateAsync(
        reportId: string,
        expectedStatus: PlayerReportStatus,
        set: Partial<IPlayerReportEntity>,
    ): Promise<PlayerReportUpdateResult> {
        const dbService = await this.requireDbServiceAsync();
        try {
            const report = await dbService.updatePlayerReportAsync(reportId, expectedStatus, set);
            return { success: true, report };
        } catch (error) {
            if (error?.name !== 'ConditionalCheckFailedException') {
                throw error;
            }

            const existing = await dbService.getPlayerReportAsync(reportId, { consistentRead: true });
            return existing
                ? { success: false, reason: 'conflict', message: `Report is already ${existing.report.status.toLowerCase()}` }
                : { success: false, reason: 'notFound', message: 'Report not found' };
        }
    }

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
            reportsAgainst: reportIndex.filter((entry) => entry.role === PlayerReportRole.Reported).sort(newestFirst),
            reportsFiled: reportIndex.filter((entry) => entry.role === PlayerReportRole.Reporter).sort(newestFirst),
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
            at: PlayerReportService.toIsoDate(entry.date),
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

    private static toIsoDate(value: Date | string): string {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
}
