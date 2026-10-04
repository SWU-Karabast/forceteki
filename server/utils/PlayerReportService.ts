import { v4 as uuid } from 'uuid';
import { logger } from '../logger';
import { closedPlayerReportGsiKey, getDynamoDbServiceAsync, OPEN_PLAYER_REPORT_GSI_KEY } from '../services/DynamoDBService';
import type {
    IActiveModActionCacheEntry,
    IModActionEntity,
    IPlayerReportEntity,
    IPlayerReportIndexEntity,
    IPlayerReportLogEntity,
    IPlayerReportLogLine
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
    modActions: IModActionEntity[];
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

    /** Months scanned per closed-report page */
    private static readonly ClosedMonthsPerPage = 3;

    /** DynamoDB items are capped at 400 KB; keep each log well below that */
    private static readonly MaxLogBytes = 300_000;
    private static readonly MaxLogLineLength = 2000;
    private static readonly MaxDescriptionLength = 2000;

    private readonly dbServicePromise = getDynamoDbServiceAsync();

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
        const dbService = await this.dbServicePromise;
        const reports = await dbService.getPlayerReportsByGsiKeyAsync(OPEN_PLAYER_REPORT_GSI_KEY);
        return reports.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    /**
     * Closed reports, newest first, a few months at a time.
     * @param beforeMonth YYYY-MM month to continue from (exclusive); omitted for the current month
     */
    public async getClosedReportsAsync(beforeMonth?: string): Promise<IClosedPlayerReportPage> {
        const dbService = await this.dbServicePromise;

        let month = beforeMonth
            ? PlayerReportService.previousMonth(beforeMonth)
            : PlayerReportService.monthOf(new Date());
        const reports: IPlayerReportEntity[] = [];
        let scanned = 0;

        while (month >= PlayerReportService.FirstReportMonth && scanned < PlayerReportService.ClosedMonthsPerPage) {
            reports.push(...await dbService.getPlayerReportsByGsiKeyAsync(closedPlayerReportGsiKey(month)));
            scanned++;
            month = PlayerReportService.previousMonth(month);
        }

        reports.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));

        // `month` is now the next unscanned month; the cursor is exclusive, so hand back the month after it
        const hasOlder = month >= PlayerReportService.FirstReportMonth;
        return { reports, nextBeforeMonth: hasOlder ? PlayerReportService.nextMonth(month) : null };
    }

    public async getOpenReportCountAsync(): Promise<number> {
        return (await this.getOpenReportsAsync()).length;
    }

    public async getReportDetailAsync(reportId: string): Promise<IPlayerReportDetail | null> {
        const dbService = await this.dbServicePromise;
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
        const dbService = await this.dbServicePromise;
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
        }, []);
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

        const result = await this.updateAsync(
            reportId,
            PlayerReportStatus.Open,
            set,
            trimmedNote ? [] : ['closingNote'],
            closedPlayerReportGsiKey(PlayerReportService.monthOf(new Date(closedAt)))
        );
        if (result.success) {
            await this.syncIndexAsync(result.report);
            logger.info(`PlayerReportService: Moderator ${moderator.username} closed report ${reportId} as ${outcome}`, { reportId, outcome });
        }
        return result;
    }

    public async reopenReportAsync(reportId: string, moderator: IModerator): Promise<PlayerReportUpdateResult> {
        const now = new Date().toISOString();
        const result = await this.updateAsync(
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
            OPEN_PLAYER_REPORT_GSI_KEY
        );
        if (result.success) {
            await this.syncIndexAsync(result.report);
            logger.info(`PlayerReportService: Moderator ${moderator.username} reopened report ${reportId}`, { reportId });
        }
        return result;
    }

    // ==================== Helpers ====================

    private async updateAsync(
        reportId: string,
        expectedStatus: PlayerReportStatus,
        set: Partial<IPlayerReportEntity>,
        remove: (keyof IPlayerReportEntity)[],
        gsiKey?: string,
    ): Promise<PlayerReportUpdateResult> {
        const dbService = await this.dbServicePromise;
        try {
            const report = await dbService.updatePlayerReportAsync(reportId, expectedStatus, set, remove, gsiKey);
            return { success: true, report };
        } catch (error) {
            if (error?.name !== 'ConditionalCheckFailedException') {
                throw error;
            }

            const existing = await dbService.getPlayerReportAsync(reportId);
            return existing
                ? { success: false, reason: 'conflict', message: `Report is already ${existing.report.status.toLowerCase()}` }
                : { success: false, reason: 'notFound', message: 'Report not found' };
        }
    }

    private async syncIndexAsync(report: IPlayerReportEntity): Promise<void> {
        const dbService = await this.dbServicePromise;
        await Promise.all([
            dbService.updatePlayerReportIndexAsync(report.reporterId, PlayerReportRole.Reporter, report.id, report.status, report.outcome),
            dbService.updatePlayerReportIndexAsync(report.reportedPlayerId, PlayerReportRole.Reported, report.id, report.status, report.outcome),
        ]);
    }

    private async getPlayerContextAsync(playerId: string, usernameAtReport: string): Promise<IPlayerReportPlayerContext> {
        const dbService = await this.dbServicePromise;
        const modActionService = this.getModActionService();

        const [profile, modActions, reportIndex] = await Promise.all([
            dbService.getUserProfileAsync(playerId),
            this.userFactory.getModActionHistoryAsync(playerId),
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
            modActions,
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

    /** YYYY-MM in UTC */
    public static monthOf(date: Date): string {
        return date.toISOString().substring(0, 7);
    }

    public static previousMonth(month: string): string {
        const [year, monthNumber] = month.split('-').map(Number);
        return PlayerReportService.monthOf(new Date(Date.UTC(year, monthNumber - 2, 1)));
    }

    public static nextMonth(month: string): string {
        const [year, monthNumber] = month.split('-').map(Number);
        return PlayerReportService.monthOf(new Date(Date.UTC(year, monthNumber, 1)));
    }
}
