import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import type {
    IModActionEntity,
    IPlayerReportCleanupCursor,
    IPlayerReportEntity,
    IPlayerReportIndexEntity,
    IPlayerReportLogEntity,
    IUsernameChangeEntity
} from '../../../server/services/DynamoDBInterfaces';
import {
    ModActionType,
    PlayerReportLogKind,
    PlayerReportOutcome,
    PlayerReportRole,
    PlayerReportStatus,
    UsernameChangeSource
} from '../../../server/services/DynamoDBInterfaces';
import type { ISerializedMessage } from '../../../server/game/Interfaces';
import { PlayerReportType } from '../../../server/game/Interfaces';
import type { INewPlayerReport } from '../../../server/utils/PlayerReportService';
import { PlayerReportService } from '../../../server/utils/PlayerReportService';
import { monthOf } from '../../../server/utils/RetentionBuckets';
import type { UserFactory } from '../../../server/utils/user/UserFactory';
import type { ModActionService } from '../../../server/utils/ModActionService';

type DynamoDBService = Awaited<ReturnType<typeof DynamoDBServiceModule.getDynamoDbServiceAsync>>;

/**
 * In-memory stand-in for the player report part of DynamoDBService, keyed the same way as the real table.
 */
class FakeReportDb {
    public reports = new Map<string, { report: IPlayerReportEntity; gsiKey: string }>();
    public logs = new Map<string, IPlayerReportLogEntity[]>();
    public logExpiry = new Map<string, string>();
    public index: IPlayerReportIndexEntity[] = [];
    public cursor: IPlayerReportCleanupCursor | null = null;
    public queriedGsiKeys: string[] = [];

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

    public updatePlayerReportAsync(reportId: string, expectedStatus: PlayerReportStatus, set: Partial<IPlayerReportEntity>, remove: (keyof IPlayerReportEntity)[] = [], gsiKey?: string) {
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

    /** Fails like a cancelled transaction would, so tests can simulate a concurrent change */
    public failNextTransitions = 0;

    public transitionPlayerReportAsync(
        report: IPlayerReportEntity,
        expectedStatus: PlayerReportStatus,
        set: Partial<IPlayerReportEntity>,
        remove: (keyof IPlayerReportEntity)[],
        gsiKey: string,
        logExpiryGsiKey: string | null
    ) {
        if (this.failNextTransitions > 0) {
            this.failNextTransitions--;
            return Promise.resolve({ success: false as const, reason: 'condition' as const });
        }
        return this.updatePlayerReportAsync(report.id, expectedStatus, set, remove, gsiKey).then((updated) => {
            for (const entry of this.index.filter((e) => e.reportId === report.id)) {
                entry.status = updated.status;
                entry.outcome = updated.outcome;
            }
            if (this.logs.has(report.id)) {
                if (logExpiryGsiKey) {
                    this.logExpiry.set(report.id, logExpiryGsiKey);
                } else {
                    this.logExpiry.delete(report.id);
                }
            }
            return { success: true as const, report: updated };
        });
    }

    public queryAttributesByGsiAsync(gsiKey: string) {
        this.queriedGsiKeys.push(gsiKey);
        const fromLogs = [...this.logExpiry.entries()].filter(([, key]) => key === gsiKey).map(([reportId]) => ({ reportId }));
        const fromReports = [...this.reports.values()].filter((stored) => stored.gsiKey === gsiKey).map((stored) => ({
            id: stored.report.id, reporterId: stored.report.reporterId, reportedPlayerId: stored.report.reportedPlayerId,
        }));
        return Promise.resolve([...fromLogs, ...fromReports]);
    }

    /** Throws for these reports, to test that one failure does not stop the cleanup */
    public failingCleanupIds = new Set<string>();

    private isDueForCleanup(reportId: string, closedBefore: string) {
        if (this.failingCleanupIds.has(reportId)) {
            throw new Error(`throttled on ${reportId}`);
        }
        const report = this.reports.get(reportId)?.report;
        return report?.status === PlayerReportStatus.Closed && report.closedAt < closedBefore;
    }

    public deletePlayerReportLogsAsync(reportId: string, deletedAt: string, closedBefore: string) {
        if (!this.isDueForCleanup(reportId, closedBefore)) {
            return Promise.resolve(false);
        }
        this.logs.delete(reportId);
        this.logExpiry.delete(reportId);
        const stored = this.reports.get(reportId);
        if (stored) {
            stored.report = { ...stored.report, logsDeletedAt: deletedAt };
        }
        return Promise.resolve(true);
    }

    public deletePlayerReportAsync(reportId: string, _reporterId: string, _reportedPlayerId: string, closedBefore: string) {
        if (!this.isDueForCleanup(reportId, closedBefore)) {
            return Promise.resolve(false);
        }
        this.reports.delete(reportId);
        this.logs.delete(reportId);
        this.logExpiry.delete(reportId);
        this.index = this.index.filter((entry) => entry.reportId !== reportId);
        return Promise.resolve(true);
    }

    public getPlayerReportCleanupCursorAsync() {
        return Promise.resolve(this.cursor);
    }

    public savePlayerReportCleanupCursorAsync(cursor: IPlayerReportCleanupCursor) {
        this.cursor = { ...cursor };
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
    let usernameChangesByPlayer: Map<string, IUsernameChangeEntity[]>;
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
        usernameChangesByPlayer = new Map();
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(db as unknown as DynamoDBService);

        const userFactory = {
            getModActionHistoryAsync: (playerId: string) => Promise.resolve(modActionsByPlayer.get(playerId) ?? []),
            getUsernameChangeHistoryAsync: (playerId: string) => Promise.resolve(usernameChangesByPlayer.get(playerId) ?? []),
        } as unknown as UserFactory;
        const modActionService = {
            isPlayerMuted: (playerId: string) => playerId === reportedPlayer.id,
            playerActiveRename: () => null,
            getActiveReportingDisabledActionId: (playerId: string) => (playerId === reporter.id ? 'reporting-disabled-action' : null),
            getActiveUsernameChangesBlockedActionId: (playerId: string) => (playerId === reportedPlayer.id ? 'username-blocked-action' : null),
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
            expect(stored.gsiKey).toBe(DynamoDBServiceModule.closedPlayerReportGsiKey(monthOf(new Date())));
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

        it('retries a close once when the report changed underneath, then reports the new state', async function() {
            const report = await service.createReportAsync(newReport());
            db.failNextTransitions = 1;

            const closed = await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            expect(closed.success).toBeTrue();
            expect(db.reports.get(report.id).report.status).toBe(PlayerReportStatus.Closed);
        });

        it('reports a conflict instead of failing when the report keeps changing', async function() {
            const report = await service.createReportAsync(newReport());
            db.failNextTransitions = 3;

            const result = await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            expect(result).toEqual(jasmine.objectContaining({ success: false, reason: 'conflict' }));
            expect(db.reports.get(report.id).report.status).toBe(PlayerReportStatus.Open);
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
            expect(detail.reporter.activeReportingDisabledId).toBe('reporting-disabled-action');
            expect(detail.reportedPlayer.activeReportingDisabledId).toBeNull();
            expect(detail.reportedPlayer.activeUsernameChangesBlockedId).toBe('username-blocked-action');
            expect(detail.reporter.activeUsernameChangesBlockedId).toBeNull();
            expect(detail.reportedPlayer.username).toBe('current-reported-id');
            expect(detail.reportedPlayer.reportsAgainst.length).toBe(1);
            expect(detail.reporter.reportsFiled.length).toBe(1);
            expect(detail.ticketActions.map((a) => a.id)).toEqual(['a', 'ccc']);
            expect(detail.chatLog.lines.length).toBe(2);
        });

        it('includes each player\'s username history so offensive-username reports can be judged', async function() {
            const report = await service.createReportAsync(newReport());
            const change: IUsernameChangeEntity = {
                id: 'change-1', playerId: reportedPlayer.id, previousUsername: 'OffensiveName', newUsername: 'current-reported-id',
                source: UsernameChangeSource.UserInitiated, createdAt: '2026-10-01T00:00:00.000Z',
            };
            usernameChangesByPlayer.set(reportedPlayer.id, [change]);

            const detail = await service.getReportDetailAsync(report.id);

            expect(detail.reportedPlayer.usernameChanges).toEqual([change]);
            expect(detail.reporter.usernameChanges).toEqual([]);
        });

        it('falls back to the username at report time for players without a profile', async function() {
            const report = await service.createReportAsync(newReport({ reportedPlayer: { id: 'anonymous-id', username: 'Guest' } }));

            const detail = await service.getReportDetailAsync(report.id);

            expect(detail.reportedPlayer.username).toBe('Guest');
            expect(detail.reportedPlayer.createdAt).toBeUndefined();
        });

        it('accepts only the two players of a report as targets for actions issued from it', async function() {
            const report = await service.createReportAsync(newReport());

            expect(await service.isParticipantAsync(report.id, reporter.id)).toBeTrue();
            expect(await service.isParticipantAsync(report.id, reportedPlayer.id)).toBeTrue();
            expect(await service.isParticipantAsync(report.id, 'someone-else')).toBeFalse();
            expect(await service.isParticipantAsync('missing', reporter.id)).toBeFalse();
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

    describe('retention', function() {
        const DAY_MS = 24 * 60 * 60 * 1000;

        const closeAt = async (closedAt: string) => {
            const report = await service.createReportAsync(newReport());
            jasmine.clock().mockDate(new Date(closedAt));
            await service.closeReportAsync(report.id, PlayerReportOutcome.Punished, undefined, moderator);
            return report.id;
        };

        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('puts the logs of a closed ticket into the bucket of the day they expire and takes them out on reopen', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');

            expect(db.logExpiry.get(reportId)).toBe(DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-11-04'));

            await service.reopenReportAsync(reportId, moderator);

            expect(db.logExpiry.has(reportId)).toBeFalse();
        });

        it('deletes logs only after the retention period and keeps the report itself', async function() {
            const expired = await closeAt('2026-10-05T18:00:00.000Z');
            const notYet = await closeAt('2026-10-06T09:00:00.000Z');

            // 2026-11-05: the 2026-11-04 bucket is complete, the 2026-11-05 bucket is not processed yet
            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result).toEqual({ logsDeleted: 1, reportsDeleted: 0 });
            expect(db.logs.has(expired)).toBeFalse();
            expect(db.reports.get(expired).report.logsDeletedAt).toBe('2026-11-05T08:00:00.000Z');
            expect(db.logs.has(notYet)).toBeTrue();
            expect(db.cursor.lastLogDay).toBe('2026-11-04');

            const nextDay = await service.runRetentionCleanupAsync(new Date('2026-11-06T08:00:00.000Z'));
            expect(nextDay.logsDeleted).toBe(1);
            expect(db.logs.has(notYet)).toBeFalse();
        });

        it('keeps the logs and the report of a ticket that was reopened after the cleanup read its bucket', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            db.reports.get(reportId).report.status = PlayerReportStatus.Open;

            const result = await service.runRetentionCleanupAsync(new Date('2027-12-01T08:00:00.000Z'));

            expect(result).toEqual({ logsDeleted: 0, reportsDeleted: 0 });
            expect(db.logs.has(reportId)).toBeTrue();
            expect(db.reports.has(reportId)).toBeTrue();
        });

        it('does not delete the logs early of a ticket that was reopened and closed again', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            // Closed again later; the old expiry bucket entry is still what the cleanup reads
            db.reports.get(reportId).report.closedAt = '2026-10-20T10:00:00.000Z';

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result.logsDeleted).toBe(0);
            expect(db.logs.has(reportId)).toBeTrue();
        });

        it('carries on after a failing report and retries its bucket on the next run', async function() {
            const failing = await closeAt('2026-10-05T18:00:00.000Z');
            const working = await closeAt('2026-10-05T19:00:00.000Z');
            db.failingCleanupIds.add(failing);

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result.logsDeleted).toBe(1);
            expect(db.logs.has(working)).toBeFalse();
            expect(db.logs.has(failing)).toBeTrue();
            // The bucket of 2026-11-04 had a failure, so the cursor stays before it
            expect(db.cursor.lastLogDay).toBe('2026-11-03');

            db.failingCleanupIds.clear();
            const retry = await service.runRetentionCleanupAsync(new Date('2026-11-05T09:00:00.000Z'));
            expect(retry.logsDeleted).toBe(1);
            expect(db.cursor.lastLogDay).toBe('2026-11-04');
        });

        it('keeps going when a bucket cannot be read and retries it on the next run', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            const query = db.queryAttributesByGsiAsync.bind(db);
            const spy = spyOn(db, 'queryAttributesByGsiAsync').and.callFake((gsiKey: string) =>
                (gsiKey === DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-11-03') ? Promise.reject(new Error('throttled')) : query(gsiKey)));

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            // The later 2026-11-04 bucket is still cleaned, but the cursor stays before the unreadable day
            expect(result.logsDeleted).toBe(1);
            expect(db.logs.has(reportId)).toBeFalse();
            expect(db.cursor.lastLogDay).toBe('2026-11-02');

            spy.and.callFake(query);
            await service.runRetentionCleanupAsync(new Date('2026-11-05T09:00:00.000Z'));
            expect(db.cursor.lastLogDay).toBe('2026-11-04');
        });

        it('never deletes the logs of open tickets', async function() {
            const open = await service.createReportAsync(newReport());

            await service.runRetentionCleanupAsync(new Date(Date.now() + 400 * DAY_MS));

            expect(db.logs.has(open.id)).toBeTrue();
        });

        it('only queries buckets it has not processed yet', async function() {
            await service.runRetentionCleanupAsync(new Date('2026-10-10T08:00:00.000Z'));
            db.queriedGsiKeys = [];

            await service.runRetentionCleanupAsync(new Date('2026-10-12T08:00:00.000Z'));

            expect(db.queriedGsiKeys).toEqual([
                DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-10-10'),
                DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-10-11'),
            ]);
        });

        it('deletes whole reports once they have been closed for the metadata retention period', async function() {
            const old = await closeAt('2026-10-20T12:00:00.000Z');
            const recent = await closeAt('2026-11-02T12:00:00.000Z');

            // October 2026 is more than 12 months before November 2027, November 2026 is not
            const result = await service.runRetentionCleanupAsync(new Date('2027-11-01T08:00:00.000Z'));

            expect(result.reportsDeleted).toBe(1);
            expect(db.reports.has(old)).toBeFalse();
            expect(db.index.some((entry) => entry.reportId === old)).toBeFalse();
            expect(db.reports.has(recent)).toBeTrue();
            expect(db.cursor.lastMetadataMonth).toBe('2026-10');
        });

        it('does nothing without DynamoDB', async function() {
            (DynamoDBServiceModule.getDynamoDbServiceAsync as jasmine.Spy).and.resolveTo(null);
            const noUserFactory: Partial<UserFactory> = {};
            const serviceWithoutDb = new PlayerReportService(noUserFactory as UserFactory, () => undefined);

            expect(await serviceWithoutDb.runRetentionCleanupAsync()).toEqual({ logsDeleted: 0, reportsDeleted: 0 });
        });
    });
});
