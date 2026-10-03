import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import type {
    IModActionEntity,
    IPlayerReportEntity,
    IPlayerReportIndexEntity,
    IPlayerReportLogEntity
} from '../../../server/services/DynamoDBInterfaces';
import {
    ModActionType,
    PlayerReportLogKind,
    PlayerReportOutcome,
    PlayerReportRole,
    PlayerReportStatus
} from '../../../server/services/DynamoDBInterfaces';
import type { ISerializedMessage } from '../../../server/game/Interfaces';
import { PlayerReportType } from '../../../server/game/Interfaces';
import type { INewPlayerReport } from '../../../server/utils/PlayerReportService';
import { PlayerReportService } from '../../../server/utils/PlayerReportService';
import type { UserFactory } from '../../../server/utils/user/UserFactory';
import type { ModActionService } from '../../../server/utils/ModActionService';

type DynamoDBService = Awaited<ReturnType<typeof DynamoDBServiceModule.getDynamoDbServiceAsync>>;

/**
 * In-memory stand-in for the player report part of DynamoDBService, keyed the same way as the real table.
 */
class FakeReportDb {
    public reports = new Map<string, { report: IPlayerReportEntity; gsiKey: string }>();
    public logs = new Map<string, IPlayerReportLogEntity[]>();
    public index: IPlayerReportIndexEntity[] = [];

    public savePlayerReportAsync(report: IPlayerReportEntity, logs: IPlayerReportLogEntity[], entries: IPlayerReportIndexEntity[]) {
        this.reports.set(report.id, { report: { ...report }, gsiKey: DynamoDBServiceModule.OPEN_PLAYER_REPORT_GSI_KEY });
        this.logs.set(report.id, logs);
        this.index.push(...entries.map((entry) => ({ ...entry })));
        return Promise.resolve();
    }

    public getPlayerReportAsync(reportId: string) {
        const stored = this.reports.get(reportId);
        return Promise.resolve(stored ? { report: { ...stored.report }, logs: this.logs.get(reportId) ?? [] } : null);
    }

    public getPlayerReportsByGsiKeyAsync(gsiKey: string) {
        return Promise.resolve([...this.reports.values()].filter((stored) => stored.gsiKey === gsiKey).map((stored) => ({ ...stored.report })));
    }

    public getPlayerReportIndexAsync(playerId: string) {
        return Promise.resolve(this.index.filter((entry) => entry.playerId === playerId).map((entry) => ({ ...entry })));
    }

    public updatePlayerReportAsync(reportId: string, expectedStatus: PlayerReportStatus, set: Partial<IPlayerReportEntity>, remove: (keyof IPlayerReportEntity)[], gsiKey?: string) {
        const stored = this.reports.get(reportId);
        if (!stored || stored.report.status !== expectedStatus) {
            const error = new Error('The conditional request failed');
            error.name = 'ConditionalCheckFailedException';
            return Promise.reject(error);
        }
        const report: IPlayerReportEntity = Object.fromEntries(
            Object.entries({ ...stored.report, ...set }).filter(([key]) => !remove.includes(key as keyof IPlayerReportEntity))
        ) as unknown as IPlayerReportEntity;
        this.reports.set(reportId, { report, gsiKey: gsiKey ?? stored.gsiKey });
        return Promise.resolve({ ...report });
    }

    public updatePlayerReportIndexAsync(playerId: string, role: PlayerReportRole, reportId: string, status: PlayerReportStatus, outcome?: PlayerReportOutcome) {
        const entry = this.index.find((e) => e.playerId === playerId && e.role === role && e.reportId === reportId);
        entry.status = status;
        entry.outcome = outcome;
        return Promise.resolve();
    }

    public getUserProfileAsync(playerId: string) {
        return Promise.resolve(playerId === 'anonymous-id' ? undefined : { id: playerId, username: `current-${playerId}`, createdAt: '2026-01-01T00:00:00.000Z' });
    }
}

describe('PlayerReportService', function() {
    const reporter = { id: 'reporter-id', username: 'Reporter' };
    const reportedPlayer = { id: 'reported-id', username: 'Offender' };
    const moderator = { id: 'mod-id', username: 'ModAlice' };

    let db: FakeReportDb;
    let modActionsByPlayer: Map<string, IModActionEntity[]>;
    let service: PlayerReportService;

    const chatLine = (speaker: { id: string; username: string }, text: string, date = new Date()): ISerializedMessage => ({
        date,
        message: [{ type: 'playerChat', id: speaker.id, name: speaker.username }, ': ', text],
    } as unknown as ISerializedMessage);

    const gameLine = (text: string, player = reporter): ISerializedMessage => ({
        date: new Date(),
        message: [{ id: player.id, name: player.username }, ` ${text}`],
    } as unknown as ISerializedMessage);

    const newReport = (overrides: Partial<INewPlayerReport> = {}): INewPlayerReport => ({
        reporter,
        reportedPlayer,
        offense: PlayerReportType.ChatHarrasment,
        description: 'Insulted me all game',
        lobbyId: 'lobby-id',
        gameId: 'game-id',
        gameFormat: 'premier',
        matchType: 'publicLobby',
        gameStepsSinceLastUndo: 3,
        screenResolution: null,
        viewport: null,
        gameMessages: [gameLine('attacks with Wampa')],
        chatMessages: [chatLine(reportedPlayer, 'noob'), chatLine(reporter, 'gg')],
        ...overrides,
    });

    beforeEach(function() {
        db = new FakeReportDb();
        modActionsByPlayer = new Map();
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(db as unknown as DynamoDBService);

        const userFactory = {
            getModActionHistoryAsync: (playerId: string) => Promise.resolve(modActionsByPlayer.get(playerId) ?? []),
        } as unknown as UserFactory;
        const modActionService = {
            isPlayerMuted: (playerId: string) => playerId === reportedPlayer.id,
            playerActiveRename: () => null,
        } as unknown as ModActionService;

        service = new PlayerReportService(userFactory, () => modActionService);
    });

    describe('createReportAsync', function() {
        it('stores an open report with chat and game logs and an index entry for both players', async function() {
            const report = await service.createReportAsync(newReport());

            expect(report.status).toBe(PlayerReportStatus.Open);
            expect(report.reportedPlayerId).toBe(reportedPlayer.id);
            expect(report.screenResolution).toBeUndefined();

            const logs = db.logs.get(report.id);
            const chat = logs.find((log) => log.kind === PlayerReportLogKind.Chat);
            expect(chat.lines.map((line) => line.text)).toEqual(['<Offender>: noob', '<Reporter>: gg']);
            expect(chat.lines[0].playerIds).toEqual([reportedPlayer.id]);
            expect(chat.truncated).toBeFalse();

            const game = logs.find((log) => log.kind === PlayerReportLogKind.Game);
            expect(game.lines[0].text).toBe('Reporter attacks with Wampa');
            expect(game.lines[0].playerIds).toEqual([reporter.id]);

            expect(db.index.map((entry) => [entry.playerId, entry.role])).toEqual([
                [reporter.id, PlayerReportRole.Reporter],
                [reportedPlayer.id, PlayerReportRole.Reported],
            ]);
        });

        it('stores the game id as text even though the game holds it as a number', async function() {
            const report = await service.createReportAsync(newReport({ gameId: 42 as unknown as string }));

            expect(report.gameId).toBe('42');
        });

        it('snapshots prior reports against the player and false reports by the reporter', async function() {
            const first = await service.createReportAsync(newReport());
            await service.closeReportAsync(first.id, PlayerReportOutcome.FalseReport, undefined, moderator);

            const second = await service.createReportAsync(newReport());

            expect(second.reportedPlayerPriorReportCount).toBe(1);
            expect(second.reporterPriorFalseReportCount).toBe(1);
        });

        it('drops the oldest log lines when a log exceeds the storage limit and marks it truncated', async function() {
            const longText = 'x'.repeat(1900);
            const chatMessages = Array.from({ length: 400 }, (_, i) => chatLine(reportedPlayer, `${i} ${longText}`));

            const report = await service.createReportAsync(newReport({ chatMessages }));

            const chat = db.logs.get(report.id).find((log) => log.kind === PlayerReportLogKind.Chat);
            expect(chat.truncated).toBeTrue();
            expect(chat.lines.length).toBeLessThan(400);
            expect(chat.lines[chat.lines.length - 1].text).toContain('399 ');
            expect(Buffer.byteLength(JSON.stringify(chat.lines))).toBeLessThanOrEqual(300_000);
        });

        it('fails when DynamoDB is unavailable instead of silently dropping the report', async function() {
            (DynamoDBServiceModule.getDynamoDbServiceAsync as jasmine.Spy).and.resolveTo(null);
            const noUserFactory: Partial<UserFactory> = {};
            const serviceWithoutDb = new PlayerReportService(noUserFactory as UserFactory, () => undefined);

            await expectAsync(serviceWithoutDb.createReportAsync(newReport())).toBeRejectedWithError(/DynamoDB service unavailable/);
        });
    });

    describe('ticket workflow', function() {
        it('lists open reports oldest first and removes closed ones from the open list', async function() {
            const older = await service.createReportAsync(newReport());
            const newer = await service.createReportAsync(newReport());
            db.reports.get(older.id).report.createdAt = '2026-10-01T00:00:00.000Z';
            db.reports.get(newer.id).report.createdAt = '2026-10-02T00:00:00.000Z';

            expect((await service.getOpenReportsAsync()).map((r) => r.id)).toEqual([older.id, newer.id]);

            await service.closeReportAsync(older.id, PlayerReportOutcome.Punished, 'muted', moderator);

            expect((await service.getOpenReportsAsync()).map((r) => r.id)).toEqual([newer.id]);
            expect(await service.getOpenReportCountAsync()).toBe(1);
        });

        it('claims, closes with an outcome and syncs the outcome to both index entries', async function() {
            const report = await service.createReportAsync(newReport());

            const claimed = await service.claimReportAsync(report.id, moderator);
            expect(claimed.success && claimed.report.claimedByUsername).toBe('ModAlice');

            const closed = await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, '  nothing found  ', moderator);
            expect(closed.success).toBeTrue();
            const stored = db.reports.get(report.id);
            expect(stored.report.status).toBe(PlayerReportStatus.Closed);
            expect(stored.report.closingNote).toBe('nothing found');
            expect(stored.gsiKey).toBe(DynamoDBServiceModule.closedPlayerReportGsiKey(PlayerReportService.monthOf(new Date())));
            expect(db.index.every((entry) => entry.status === PlayerReportStatus.Closed && entry.outcome === PlayerReportOutcome.NoAction)).toBeTrue();
        });

        it('records timer abuse as an outcome without any other effect', async function() {
            const report = await service.createReportAsync(newReport());

            const closed = await service.closeReportAsync(report.id, PlayerReportOutcome.TimerAbuse, undefined, moderator);

            expect(closed.success).toBeTrue();
            expect(db.reports.get(report.id).report.outcome).toBe(PlayerReportOutcome.TimerAbuse);
            expect(db.index.every((entry) => entry.outcome === PlayerReportOutcome.TimerAbuse)).toBeTrue();
        });

        it('refuses to close a report twice', async function() {
            const report = await service.createReportAsync(newReport());
            await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            const second = await service.closeReportAsync(report.id, PlayerReportOutcome.Punished, undefined, moderator);

            expect(second).toEqual({ success: false, reason: 'conflict', message: 'Report is already closed' });
        });

        it('reports a missing report as not found', async function() {
            const result = await service.claimReportAsync('missing', moderator);

            expect(result).toEqual({ success: false, reason: 'notFound', message: 'Report not found' });
        });

        it('reopens a closed report, clears the closing fields and claims it for the moderator', async function() {
            const report = await service.createReportAsync(newReport());
            await service.closeReportAsync(report.id, PlayerReportOutcome.Punished, 'muted', moderator);

            const reopened = await service.reopenReportAsync(report.id, { id: 'mod-2', username: 'ModBob' });

            expect(reopened.success).toBeTrue();
            const stored = db.reports.get(report.id);
            expect(stored.report.status).toBe(PlayerReportStatus.Open);
            expect(stored.report.outcome).toBeUndefined();
            expect(stored.report.closingNote).toBeUndefined();
            expect(stored.report.claimedByUsername).toBe('ModBob');
            expect(stored.gsiKey).toBe(DynamoDBServiceModule.OPEN_PLAYER_REPORT_GSI_KEY);
            expect(db.index.every((entry) => entry.status === PlayerReportStatus.Open && entry.outcome === undefined)).toBeTrue();
        });
    });

    describe('getReportDetailAsync', function() {
        it('returns both players with context and only the actions issued from this ticket', async function() {
            const report = await service.createReportAsync(newReport());
            const action = (id: string, playerId: string, relatedReportId?: string): IModActionEntity => ({
                id, playerId, actionType: ModActionType.Warning, moderatorId: 'mod-id', moderatorUsername: 'ModAlice', createdAt: `2026-10-0${id.length}T00:00:00.000Z`, relatedReportId,
            });
            modActionsByPlayer.set(reportedPlayer.id, [action('a', reportedPlayer.id, report.id), action('bb', reportedPlayer.id)]);
            modActionsByPlayer.set(reporter.id, [action('ccc', reporter.id, report.id)]);

            const detail = await service.getReportDetailAsync(report.id);

            expect(detail.reportedPlayer.isMuted).toBeTrue();
            expect(detail.reportedPlayer.username).toBe('current-reported-id');
            expect(detail.reportedPlayer.reportsAgainst.length).toBe(1);
            expect(detail.reporter.reportsFiled.length).toBe(1);
            expect(detail.ticketActions.map((a) => a.id)).toEqual(['a', 'ccc']);
            expect(detail.chatLog.lines.length).toBe(2);
        });

        it('falls back to the username at report time for players without a profile', async function() {
            const report = await service.createReportAsync(newReport({ reportedPlayer: { id: 'anonymous-id', username: 'Guest' } }));

            const detail = await service.getReportDetailAsync(report.id);

            expect(detail.reportedPlayer.username).toBe('Guest');
            expect(detail.reportedPlayer.createdAt).toBeUndefined();
        });

        it('returns null for an unknown report', async function() {
            expect(await service.getReportDetailAsync('missing')).toBeNull();
        });
    });

    describe('getClosedReportsAsync', function() {
        it('pages backwards month by month and stops at the first report month', async function() {
            const closeIn = async (month: string) => {
                const report = await service.createReportAsync(newReport());
                await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);
                const stored = db.reports.get(report.id);
                stored.gsiKey = DynamoDBServiceModule.closedPlayerReportGsiKey(month);
                stored.report.closedAt = `${month}-15T00:00:00.000Z`;
                return report.id;
            };
            jasmine.clock().install();
            jasmine.clock().mockDate(new Date('2027-03-10T00:00:00.000Z'));
            try {
                const march = await closeIn('2027-03');
                const january = await closeIn('2027-01');
                const october = await closeIn('2026-10');

                const firstPage = await service.getClosedReportsAsync();
                expect(firstPage.reports.map((r) => r.id)).toEqual([march, january]);
                expect(firstPage.nextBeforeMonth).toBe('2027-01');

                const secondPage = await service.getClosedReportsAsync(firstPage.nextBeforeMonth);
                expect(secondPage.reports.map((r) => r.id)).toEqual([october]);
                expect(secondPage.nextBeforeMonth).toBeNull();
            } finally {
                jasmine.clock().uninstall();
            }
        });
    });

    describe('month helpers', function() {
        it('steps across year boundaries', function() {
            expect(PlayerReportService.previousMonth('2027-01')).toBe('2026-12');
            expect(PlayerReportService.nextMonth('2026-12')).toBe('2027-01');
        });
    });
});
