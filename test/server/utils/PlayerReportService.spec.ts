import * as DynamoDBServiceModule from '../../../server/services/DynamoDBService';
import type { IModActionEntity, IUsernameChangeEntity } from '../../../server/services/DynamoDBInterfaces';
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
import { InvalidReportCursorError, PlayerReportListSort } from '../../../server/utils/PlayerReportListCache';
import { monthOf } from '../../../server/utils/RetentionBuckets';
import type { UserFactory } from '../../../server/utils/user/UserFactory';
import type { ModActionService } from '../../../server/utils/ModActionService';
import { FakeDynamoDbService } from '../../helpers/server/FakeDynamoDbService';
import { TestScheduler } from '../../helpers/server/TestScheduler';

describe('PlayerReportService', function() {
    const reporter = { id: 'reporter-id', username: 'Reporter' };
    const reportedPlayer = { id: 'reported-id', username: 'Offender' };
    const moderator = { id: 'mod-id', username: 'ModAlice' };

    let db: FakeDynamoDbService;
    let scheduler: TestScheduler;
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
        gameMessages: [gameLine('attacks with Wampa')],
        chatMessages: [chatLine(reportedPlayer, 'noob'), chatLine(reporter, 'gg')],
        ...overrides,
    });

    /** Moves the virtual clock forward to `iso` */
    const advanceToAsync = (iso: string) => scheduler.advanceAsync(Math.max(0, new Date(iso).getTime() - scheduler.now()));

    beforeEach(function() {
        scheduler = new TestScheduler(Date.UTC(2026, 9, 1));
        db = new FakeDynamoDbService(() => scheduler.currentDate());
        db.addProfile({ id: reporter.id, username: `current-${reporter.id}`, createdAt: '2026-01-01T00:00:00.000Z' });
        db.addProfile({ id: reportedPlayer.id, username: `current-${reportedPlayer.id}`, createdAt: '2026-01-01T00:00:00.000Z' });
        modActionsByPlayer = new Map();
        usernameChangesByPlayer = new Map();
        spyOn(DynamoDBServiceModule, 'getDynamoDbServiceAsync').and.resolveTo(db.asService());

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

        service = new PlayerReportService(userFactory, () => modActionService, scheduler);
    });

    afterEach(function() {
        scheduler.assertNoCapturedErrors();
    });

    describe('createReportAsync', function() {
        it('stores an open report with chat and game logs and an index entry for both players', async function() {
            const report = await service.createReportAsync(newReport());

            expect(report.status).toBe(PlayerReportStatus.Open);
            expect(report.reportedPlayerId).toBe(reportedPlayer.id);

            const logs = db.playerReportLogs.get(report.id);
            const chat = logs.find((log) => log.kind === PlayerReportLogKind.Chat);
            expect(chat.lines.map((line) => line.text)).toEqual(['<Offender>: noob', '<Reporter>: gg']);
            expect(chat.lines[0].playerIds).toEqual([reportedPlayer.id]);
            expect(chat.truncated).toBeFalse();

            const game = logs.find((log) => log.kind === PlayerReportLogKind.Game);
            expect(game.lines[0].text).toBe('Reporter attacks with Wampa');
            expect(game.lines[0].playerIds).toEqual([reporter.id]);

            expect(db.playerReportIndex.map((entry) => [entry.playerId, entry.role])).toEqual([
                [reporter.id, PlayerReportRole.ReportSubmitter],
                [reportedPlayer.id, PlayerReportRole.ReportedPlayer],
            ]);
            // Both entries name the match, so reports from one match can be grouped later
            expect(db.playerReportIndex.every((entry) => entry.lobbyId === 'lobby-id' && entry.gameId === 'game-id')).toBeTrue();
        });

        it('indexes a report filed in a lobby without a game id', async function() {
            const report = await service.createReportAsync(newReport({ gameId: undefined }));

            const [entry] = await db.getPlayerReportIndexAsync(reportedPlayer.id);
            expect(entry.reportId).toBe(report.id);
            expect(entry.lobbyId).toBe('lobby-id');
            expect(entry.gameId).toBeUndefined();
        });

        it('stores the game id as text even though the game holds it as a number', async function() {
            const report = await service.createReportAsync(newReport({ gameId: 42 as unknown as string }));

            expect(report.gameId).toBe('42');
        });

        it('snapshots prior reports against the player and the reporter\'s false reports of the last 30 days', async function() {
            const old = await service.createReportAsync(newReport());
            await service.closeReportAsync(old.id, PlayerReportOutcome.FalseReport, undefined, moderator);
            await advanceToAsync('2026-10-20T00:00:00.000Z');
            const recent = await service.createReportAsync(newReport());
            await service.closeReportAsync(recent.id, PlayerReportOutcome.FalseReport, undefined, moderator);

            await advanceToAsync('2026-11-05T00:00:00.000Z');
            const third = await service.createReportAsync(newReport());

            expect(third.reportedPlayerPriorReportCount).toBe(2);
            expect(third.reporterRecentFalseReportCount).toBe(1);
        });

        it('drops the oldest log lines when a log exceeds the storage limit and marks it truncated', async function() {
            const longText = 'x'.repeat(1900);
            const chatMessages = Array.from({ length: 400 }, (_, i) => chatLine(reportedPlayer, `${i} ${longText}`));

            const report = await service.createReportAsync(newReport({ chatMessages }));

            const chat = db.playerReportLogs.get(report.id).find((log) => log.kind === PlayerReportLogKind.Chat);
            expect(chat.truncated).toBeTrue();
            expect(chat.lines.length).toBeLessThan(400);
            expect(chat.lines[chat.lines.length - 1].text).toContain('399 ');
            expect(Buffer.byteLength(JSON.stringify(chat.lines))).toBeLessThanOrEqual(300_000);
        });

        it('fails when DynamoDB is unavailable instead of silently dropping the report', async function() {
            (DynamoDBServiceModule.getDynamoDbServiceAsync as jasmine.Spy).and.resolveTo(null);
            const noUserFactory: Partial<UserFactory> = {};
            const serviceWithoutDb = new PlayerReportService(noUserFactory as UserFactory, () => undefined, scheduler);

            await expectAsync(serviceWithoutDb.createReportAsync(newReport())).toBeRejectedWithError(/DynamoDB service unavailable/);
        });
    });

    describe('ticket workflow', function() {
        it('closes with an outcome through a status update and syncs the outcome to both index entries', async function() {
            const report = await service.createReportAsync(newReport());

            const closed = await service.updateStatusAsync(report.id, { status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.NoAction, closingNote: '  nothing found  ' }, moderator);

            expect(closed.success).toBeTrue();
            const stored = db.playerReports.get(report.id);
            expect(stored.report.status).toBe(PlayerReportStatus.Closed);
            expect(stored.report.closingNote).toBe('nothing found');
            expect(stored.report.closedByUsername).toBe('ModAlice');
            expect(stored.report.closedAt).toBe(scheduler.currentDate().toISOString());
            expect(stored.gsiKey).toBe(DynamoDBServiceModule.closedPlayerReportGsiKey(monthOf(scheduler.currentDate())));
            expect(db.playerReportIndex.every((entry) => entry.status === PlayerReportStatus.Closed && entry.outcome === PlayerReportOutcome.NoAction)).toBeTrue();
        });

        it('records timer abuse as an outcome without any other effect', async function() {
            const report = await service.createReportAsync(newReport());

            const closed = await service.closeReportAsync(report.id, PlayerReportOutcome.TimerAbuse, undefined, moderator);

            expect(closed.success).toBeTrue();
            expect(db.playerReports.get(report.id).report.outcome).toBe(PlayerReportOutcome.TimerAbuse);
            expect(db.playerReportIndex.every((entry) => entry.outcome === PlayerReportOutcome.TimerAbuse)).toBeTrue();
        });

        it('refuses to close a report twice', async function() {
            const report = await service.createReportAsync(newReport());
            await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            const second = await service.closeReportAsync(report.id, PlayerReportOutcome.ActionTaken, undefined, moderator);

            expect(second).toEqual({ success: false, reason: 'conflict', message: 'Report is already closed' });
        });

        it('reports a missing report as not found', async function() {
            const result = await service.updateStatusAsync('missing', { status: PlayerReportStatus.Open }, moderator);

            expect(result).toEqual({ success: false, reason: 'notFound', message: 'Report not found' });
        });

        it('reopens a closed report through a status update and clears the closing fields', async function() {
            const report = await service.createReportAsync(newReport());
            await service.closeReportAsync(report.id, PlayerReportOutcome.ActionTaken, 'muted', moderator);

            const reopened = await service.updateStatusAsync(report.id, { status: PlayerReportStatus.Open }, { id: 'mod-2', username: 'ModBob' });

            expect(reopened.success).toBeTrue();
            const stored = db.playerReports.get(report.id);
            expect(stored.report.status).toBe(PlayerReportStatus.Open);
            expect(stored.report.outcome).toBeUndefined();
            expect(stored.report.closingNote).toBeUndefined();
            expect(stored.report.closedByUsername).toBeUndefined();
            expect(stored.report.reopenedByUsername).toBe('ModBob');
            expect(stored.gsiKey).toBe(DynamoDBServiceModule.OPEN_PLAYER_REPORT_GSI_KEY);
            expect(db.playerReportIndex.every((entry) => entry.status === PlayerReportStatus.Open && entry.outcome === undefined)).toBeTrue();
            // Status changes keep the match the report was filed in
            expect(db.playerReportIndex.every((entry) => entry.lobbyId === 'lobby-id' && entry.gameId === 'game-id')).toBeTrue();
        });

        it('retries a close once when the report changed underneath, then reports the new state', async function() {
            const report = await service.createReportAsync(newReport());
            db.failNextPlayerReportTransitions = 1;

            const closed = await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            expect(closed.success).toBeTrue();
            expect(db.playerReports.get(report.id).report.status).toBe(PlayerReportStatus.Closed);
        });

        it('reports a conflict instead of failing when the report keeps changing', async function() {
            const report = await service.createReportAsync(newReport());
            db.failNextPlayerReportTransitions = 3;

            const result = await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);

            expect(result).toEqual(jasmine.objectContaining({ success: false, reason: 'conflict' }));
            expect(db.playerReports.get(report.id).report.status).toBe(PlayerReportStatus.Open);
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

        it('accepts only the two players of an open report as targets for actions issued from it', async function() {
            const report = await service.createReportAsync(newReport());
            const getReport = spyOn(db, 'getPlayerReportAsync').and.callThrough();

            expect(await service.getActionTargetErrorAsync(report.id, reporter.id)).toBeNull();
            expect(await service.getActionTargetErrorAsync(report.id, reportedPlayer.id)).toBeNull();
            expect(await service.getActionTargetErrorAsync(report.id, 'someone-else')).toBe('notParticipant');
            expect(await service.getActionTargetErrorAsync('missing', reporter.id)).toBe('notFound');
            // Only the report record is read, never its logs
            expect(getReport).not.toHaveBeenCalled();

            await service.closeReportAsync(report.id, PlayerReportOutcome.NoAction, undefined, moderator);
            expect(await service.getActionTargetErrorAsync(report.id, reportedPlayer.id)).toBe('closed');
        });

        it('returns null for an unknown report', async function() {
            expect(await service.getReportDetailAsync('missing')).toBeNull();
        });
    });

    describe('listReportsAsync', function() {
        const createAt = async (iso: string, overrides: Partial<INewPlayerReport> = {}) => {
            await advanceToAsync(iso);
            return (await service.createReportAsync(newReport(overrides))).id;
        };

        it('pages newest first by count, across months and statuses', async function() {
            const october = await createAt('2026-10-03T00:00:00.000Z');
            const november = await createAt('2026-11-10T00:00:00.000Z');
            const december = await createAt('2026-12-01T00:00:00.000Z');
            await service.closeReportAsync(october, PlayerReportOutcome.NoAction, undefined, moderator);

            const first = await service.listReportsAsync({ limit: 2 });
            expect(first.reports.map((r) => r.id)).toEqual([december, november]);
            expect(first.total).toBe(3);
            expect(first.nextCursor).not.toBeNull();

            const second = await service.listReportsAsync({ limit: 2, cursor: first.nextCursor });
            expect(second.reports.map((r) => r.id)).toEqual([october]);
            expect(second.nextCursor).toBeNull();
        });

        it('keeps its place when new reports arrive between pages', async function() {
            const first = await createAt('2026-10-02T00:00:00.000Z');
            const second = await createAt('2026-10-03T00:00:00.000Z');

            const page = await service.listReportsAsync({ limit: 1 });
            await createAt('2026-10-04T00:00:00.000Z');
            const next = await service.listReportsAsync({ limit: 1, cursor: page.nextCursor });

            expect(page.reports.map((r) => r.id)).toEqual([second]);
            expect(next.reports.map((r) => r.id)).toEqual([first]);
        });

        it('filters by status, offense and any of the three usernames, ignoring case', async function() {
            const closed = await createAt('2026-10-02T00:00:00.000Z');
            const open = await createAt('2026-10-03T00:00:00.000Z', { reporter: { id: 'other-id', username: 'SomeoneElse' } });
            await service.closeReportAsync(closed, PlayerReportOutcome.NoAction, undefined, moderator);

            expect((await service.listReportsAsync({ limit: 10, status: PlayerReportStatus.Open })).reports.map((r) => r.id)).toEqual([open]);
            expect((await service.listReportsAsync({ limit: 10, status: PlayerReportStatus.Closed })).reports.map((r) => r.id)).toEqual([closed]);
            expect((await service.listReportsAsync({ limit: 10, search: 'someone' })).reports.map((r) => r.id)).toEqual([open]);
            expect((await service.listReportsAsync({ limit: 10, search: 'OFFEND' })).total).toBe(2);
            expect((await service.listReportsAsync({ limit: 10, search: 'modalice' })).reports.map((r) => r.id)).toEqual([closed]);
            expect((await service.listReportsAsync({ limit: 10, offense: PlayerReportType.ChatHarrasment })).total).toBe(2);
            expect((await service.listReportsAsync({ limit: 10, offense: PlayerReportType.OffensiveUsername })).total).toBe(0);
        });

        it('counts open reports without reading DynamoDB again until the cache is stale', async function() {
            await createAt('2026-10-02T00:00:00.000Z');
            const closed = await createAt('2026-10-03T00:00:00.000Z');
            expect(await service.getOpenReportCountAsync()).toBe(2);

            const reads = spyOn(db, 'getPlayerReportsByGsiKeyAsync').and.callThrough();
            await service.closeReportAsync(closed, PlayerReportOutcome.NoAction, undefined, moderator);
            expect(await service.getOpenReportCountAsync()).toBe(1);
            expect(reads).not.toHaveBeenCalled();

            await scheduler.advanceAsync(PlayerReportService.ListCacheMaxAgeMs);
            expect(await service.getOpenReportCountAsync()).toBe(1);
            expect(reads).toHaveBeenCalled();
        });

        it('picks up reports written by another process once the cache is reloaded', async function() {
            await createAt('2026-10-02T00:00:00.000Z');
            expect((await service.listReportsAsync({ limit: 10 })).total).toBe(1);

            const noUserFactory: Partial<UserFactory> = {};
            const otherProcess = new PlayerReportService(noUserFactory as UserFactory, () => undefined, scheduler);
            await otherProcess.createReportAsync(newReport());
            expect((await service.listReportsAsync({ limit: 10 })).total).toBe(1);

            await scheduler.advanceAsync(PlayerReportService.ListCacheMaxAgeMs);
            expect((await service.listReportsAsync({ limit: 10 })).total).toBe(2);
        });

        it('rejects a cursor it did not hand out', async function() {
            await expectAsync(service.listReportsAsync({ limit: 10, cursor: 'not-a-cursor' })).toBeRejectedWithError(InvalidReportCursorError);
        });

        it('lists open reports oldest first unless another order is asked for', async function() {
            const older = await createAt('2026-10-02T00:00:00.000Z');
            const newer = await createAt('2026-10-03T00:00:00.000Z');
            const newest = await createAt('2026-10-04T00:00:00.000Z');

            const first = await service.listReportsAsync({ limit: 2, status: PlayerReportStatus.Open });
            expect(first.reports.map((r) => r.id)).toEqual([older, newer]);
            const second = await service.listReportsAsync({ limit: 2, status: PlayerReportStatus.Open, cursor: first.nextCursor });
            expect(second.reports.map((r) => r.id)).toEqual([newest]);

            expect((await service.listReportsAsync({ limit: 10, status: PlayerReportStatus.Open, sort: PlayerReportListSort.NewestFirst })).reports.map((r) => r.id))
                .toEqual([newest, newer, older]);
            expect((await service.listReportsAsync({ limit: 10, sort: PlayerReportListSort.OldestFirst })).reports.map((r) => r.id))
                .toEqual([older, newer, newest]);
        });

        it('rejects a cursor handed out for another sort order', async function() {
            await createAt('2026-10-02T00:00:00.000Z');
            await createAt('2026-10-03T00:00:00.000Z');
            const page = await service.listReportsAsync({ limit: 1, sort: PlayerReportListSort.NewestFirst });

            await expectAsync(service.listReportsAsync({ limit: 1, sort: PlayerReportListSort.OldestFirst, cursor: page.nextCursor }))
                .toBeRejectedWithError(InvalidReportCursorError);
        });

        it('keeps a closed report closed when opening the ticket reads a stale copy', async function() {
            const id = await createAt('2026-10-02T00:00:00.000Z');
            // The list is loaded, as it is while moderators work the queue
            expect(await service.getOpenReportCountAsync()).toBe(1);
            const staleCopy = await db.getPlayerReportAsync(id);
            await service.closeReportAsync(id, PlayerReportOutcome.NoAction, undefined, moderator);

            // A lagging replica still returns the report as it was before closing
            spyOn(db, 'getPlayerReportAsync').and.resolveTo(staleCopy);
            await service.getReportDetailAsync(id);

            expect(await service.getOpenReportCountAsync()).toBe(0);
            expect((await service.listReportsAsync({ limit: 10 })).reports[0].status).toBe(PlayerReportStatus.Closed);
        });

        it('drops reports deleted by the retention cleanup from the list', async function() {
            const old = await createAt('2026-10-20T12:00:00.000Z');
            await service.closeReportAsync(old, PlayerReportOutcome.NoAction, undefined, moderator);
            expect((await service.listReportsAsync({ limit: 10 })).total).toBe(1);

            await service.runRetentionCleanupAsync(new Date('2027-11-01T08:00:00.000Z'));

            expect((await service.listReportsAsync({ limit: 10 })).total).toBe(0);
        });
    });

    describe('retention', function() {
        const DAY_MS = 24 * 60 * 60 * 1000;

        const closeAt = async (closedAt: string) => {
            const report = await service.createReportAsync(newReport());
            await advanceToAsync(closedAt);
            await service.closeReportAsync(report.id, PlayerReportOutcome.ActionTaken, undefined, moderator);
            return report.id;
        };

        it('puts the logs of a closed ticket into the bucket of the day they expire and takes them out on reopen', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');

            expect(db.playerReportLogExpiry.get(reportId)).toBe(DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-11-04'));

            await service.reopenReportAsync(reportId, moderator);

            expect(db.playerReportLogExpiry.has(reportId)).toBeFalse();
        });

        it('deletes logs only after the retention period and keeps the report itself', async function() {
            const expired = await closeAt('2026-10-05T18:00:00.000Z');
            const notYet = await closeAt('2026-10-06T09:00:00.000Z');

            // 2026-11-05: the 2026-11-04 bucket is complete, the 2026-11-05 bucket is not processed yet
            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result).toEqual({ logsDeleted: 1, reportsDeleted: 0 });
            expect(db.playerReportLogs.has(expired)).toBeFalse();
            expect(db.playerReports.get(expired).report.logsDeletedAt).toBe('2026-11-05T08:00:00.000Z');
            expect(db.playerReportLogs.has(notYet)).toBeTrue();
            expect(db.playerReportCleanupCursor.lastLogDay).toBe('2026-11-04');

            const nextDay = await service.runRetentionCleanupAsync(new Date('2026-11-06T08:00:00.000Z'));
            expect(nextDay.logsDeleted).toBe(1);
            expect(db.playerReportLogs.has(notYet)).toBeFalse();
        });

        it('keeps the logs and the report of a ticket that was reopened after the cleanup read its bucket', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            db.playerReports.get(reportId).report.status = PlayerReportStatus.Open;

            const result = await service.runRetentionCleanupAsync(new Date('2027-12-01T08:00:00.000Z'));

            expect(result).toEqual({ logsDeleted: 0, reportsDeleted: 0 });
            expect(db.playerReportLogs.has(reportId)).toBeTrue();
            expect(db.playerReports.has(reportId)).toBeTrue();
        });

        it('does not delete the logs early of a ticket that was reopened and closed again', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            // Closed again later; the old expiry bucket entry is still what the cleanup reads
            db.playerReports.get(reportId).report.closedAt = '2026-10-20T10:00:00.000Z';

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result.logsDeleted).toBe(0);
            expect(db.playerReportLogs.has(reportId)).toBeTrue();
        });

        it('carries on after a failing report and retries its bucket on the next run', async function() {
            const failing = await closeAt('2026-10-05T18:00:00.000Z');
            const working = await closeAt('2026-10-05T19:00:00.000Z');
            db.failingPlayerReportCleanupIds.add(failing);

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            expect(result.logsDeleted).toBe(1);
            expect(db.playerReportLogs.has(working)).toBeFalse();
            expect(db.playerReportLogs.has(failing)).toBeTrue();
            // The bucket of 2026-11-04 had a failure, so the cursor stays before it
            expect(db.playerReportCleanupCursor.lastLogDay).toBe('2026-11-03');

            db.failingPlayerReportCleanupIds.clear();
            const retry = await service.runRetentionCleanupAsync(new Date('2026-11-05T09:00:00.000Z'));
            expect(retry.logsDeleted).toBe(1);
            expect(db.playerReportCleanupCursor.lastLogDay).toBe('2026-11-04');
        });

        it('keeps going when a bucket cannot be read and retries it on the next run', async function() {
            const reportId = await closeAt('2026-10-05T18:00:00.000Z');
            const unreadable = DynamoDBServiceModule.playerReportLogExpiryGsiKey('2026-11-03');
            db.failingGsiKeys.add(unreadable);

            const result = await service.runRetentionCleanupAsync(new Date('2026-11-05T08:00:00.000Z'));

            // The later 2026-11-04 bucket is still cleaned, but the cursor stays before the unreadable day
            expect(result.logsDeleted).toBe(1);
            expect(db.playerReportLogs.has(reportId)).toBeFalse();
            expect(db.playerReportCleanupCursor.lastLogDay).toBe('2026-11-02');

            db.failingGsiKeys.delete(unreadable);
            await service.runRetentionCleanupAsync(new Date('2026-11-05T09:00:00.000Z'));
            expect(db.playerReportCleanupCursor.lastLogDay).toBe('2026-11-04');
        });

        it('never deletes the logs of open tickets', async function() {
            const open = await service.createReportAsync(newReport());

            await service.runRetentionCleanupAsync(new Date(scheduler.now() + 400 * DAY_MS));

            expect(db.playerReportLogs.has(open.id)).toBeTrue();
        });

        it('only queries buckets it has not processed yet', async function() {
            await service.runRetentionCleanupAsync(new Date('2026-10-10T08:00:00.000Z'));
            db.queriedGsiKeys.length = 0;

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
            expect(db.playerReports.has(old)).toBeFalse();
            expect(db.playerReportIndex.some((entry) => entry.reportId === old)).toBeFalse();
            expect(db.playerReports.has(recent)).toBeTrue();
            expect(db.playerReportCleanupCursor.lastMetadataMonth).toBe('2026-10');
        });

        it('does nothing without DynamoDB', async function() {
            (DynamoDBServiceModule.getDynamoDbServiceAsync as jasmine.Spy).and.resolveTo(null);
            const noUserFactory: Partial<UserFactory> = {};
            const serviceWithoutDb = new PlayerReportService(noUserFactory as UserFactory, () => undefined, scheduler);

            expect(await serviceWithoutDb.runRetentionCleanupAsync()).toEqual({ logsDeleted: 0, reportsDeleted: 0 });
        });

        it('runs every Sunday at 03:00 UTC and records the run', async function() {
            const run = spyOn(service, 'runRetentionCleanupAsync').and.callThrough();
            await advanceToAsync('2026-10-07T12:00:00.000Z');
            db.playerReportCleanupCursor = { lastLogDay: '2026-10-06', lastMetadataMonth: '2025-09', lastRunAt: '2026-10-04T03:00:00.000Z' };

            service.scheduleRetentionCleanup();
            await advanceToAsync('2026-10-11T02:59:00.000Z');
            expect(run).not.toHaveBeenCalled();

            await advanceToAsync('2026-10-11T03:00:00.000Z');
            expect(run).toHaveBeenCalledTimes(1);
            expect(db.playerReportCleanupCursor.lastRunAt).toBe('2026-10-11T03:00:00.000Z');

            await advanceToAsync('2026-10-18T03:00:00.000Z');
            expect(run).toHaveBeenCalledTimes(2);
        });

        it('catches up shortly after a start when the last run is more than a week ago', async function() {
            const run = spyOn(service, 'runRetentionCleanupAsync').and.callThrough();
            await advanceToAsync('2026-10-14T12:00:00.000Z');
            db.playerReportCleanupCursor = { lastLogDay: '2026-10-06', lastMetadataMonth: '2025-09', lastRunAt: '2026-10-04T03:00:00.000Z' };

            service.scheduleRetentionCleanup();
            await scheduler.advanceAsync(PlayerReportService.OverdueCleanupDelayMs);

            expect(run).toHaveBeenCalledTimes(1);
        });

        it('does not catch up when the weekly run happened', async function() {
            const run = spyOn(service, 'runRetentionCleanupAsync').and.callThrough();
            await advanceToAsync('2026-10-14T12:00:00.000Z');
            db.playerReportCleanupCursor = { lastLogDay: '2026-10-10', lastMetadataMonth: '2025-09', lastRunAt: '2026-10-11T03:00:00.000Z' };

            service.scheduleRetentionCleanup();
            await scheduler.advanceAsync(PlayerReportService.OverdueCleanupDelayMs);

            expect(run).not.toHaveBeenCalled();
        });

        it('computes the next weekly run strictly after the given time', function() {
            expect(PlayerReportService.nextWeeklyCleanup(new Date('2026-10-07T12:00:00.000Z')).toISOString()).toBe('2026-10-11T03:00:00.000Z');
            expect(PlayerReportService.nextWeeklyCleanup(new Date('2026-10-11T02:59:59.000Z')).toISOString()).toBe('2026-10-11T03:00:00.000Z');
            expect(PlayerReportService.nextWeeklyCleanup(new Date('2026-10-11T03:00:00.000Z')).toISOString()).toBe('2026-10-18T03:00:00.000Z');
            expect(PlayerReportService.nextWeeklyCleanup(new Date('2026-12-28T00:00:00.000Z')).toISOString()).toBe('2027-01-03T03:00:00.000Z');
        });
    });
});
