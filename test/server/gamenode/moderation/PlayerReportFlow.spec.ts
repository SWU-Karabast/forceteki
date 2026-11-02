import { PlayerReportType } from '../../../../server/game/Interfaces';
import { ModActionType, PlayerReportOutcome, PlayerReportRole, PlayerReportStatus } from '../../../../server/services/DynamoDBInterfaces';
import { closedPlayerReportGsiKey, playerReportLogExpiryGsiKey } from '../../../../server/services/DynamoDBService';
import { PlayerReportService } from '../../../../server/utils/PlayerReportService';
import { seedRoleHolders } from '../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../helpers/server/TestClient';

/**
 * The whole life of a player report: a player files it from a game, a moderator finds it in the list, opens it,
 * takes action from it and closes it, and the weekly retention cleanup later removes its logs.
 */
describe('Player report flow', function () {
    const roles = seedRoleHolders();

    /** A game between two signed-in players in which the reported player insults the reporter, then the report */
    async function fileReportAsync(harness: ServerTestHarness, reportMessage: Record<string, unknown>): Promise<{ reporter: TestClient; reported: TestClient }> {
        const reporterAccount = harness.db.seedAccount({ username: 'ReporterPlayer' });
        const reportedAccount = harness.db.seedAccount({ username: 'RudePlayer' });
        const { first: reporter, second: reported } = await harness.startQuickGameAsync(
            harness.createAccountClient(reporterAccount),
            harness.createAccountClient(reportedAccount)
        );

        await reported.sendGameMessageAsync('chat', 'you are terrible');
        await reporter.sendLobbyMessageAsync('submitReport', 'playerReport', reportMessage, PlayerReportType.ChatHarrasment);

        expect(reporter.receivedEvents('playerReportResult').map((e) => e.args[0].success)).toEqual([true]);
        return { reporter, reported };
    }

    serverIntegration(function (contextRef) {
        it('lists, opens, acts on, closes and reopens a report filed from a game', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const { reporter, reported } = await fileReportAsync(harness, {
                description: 'insulted me',
                screenResolution: { width: 1920, height: 1080 },
                viewport: { width: 'wide', height: 900 },
            });

            const openCount = await moderator.requestAsync('get', '/api/mod/reports/open-count');
            expect(openCount.body).toEqual({ success: true, openCount: 1 });

            const list = await moderator.requestAsync('get', '/api/mod/reports?status=Open&search=rude');
            expect(list.status).toBe(200);
            expect(list.body.total).toBe(1);
            expect(list.body.nextCursor).toBeNull();
            const [summary] = list.body.reports;
            expect(summary).toEqual(jasmine.objectContaining({
                reporterId: reporter.id,
                reportedPlayerId: reported.id,
                reportedPlayerUsername: 'RudePlayer',
                description: 'insulted me',
                offense: PlayerReportType.ChatHarrasment,
                screenResolution: { width: 1920, height: 1080 },
            }));
            // A viewport that is not a plain size is dropped at the boundary instead of stored
            expect(summary.viewport).toBeUndefined();

            const detail = await moderator.requestAsync('get', `/api/mod/reports/${summary.id}`);
            expect(detail.status).toBe(200);
            const chatText = detail.body.chatLog.lines.map((line: { text: string }) => line.text);
            expect(chatText).toEqual(['<RudePlayer> you are terrible']);
            // The game log leaves the chat out, so it is not shown (and stored) twice
            expect(JSON.stringify(detail.body.gameLog.lines)).not.toContain('you are terrible');
            expect(detail.body.reportedPlayer.reportsAgainst.map((entry: { role: string }) => entry.role)).toEqual([PlayerReportRole.ReportedPlayer]);

            const outsider = harness.db.seedAccount();
            const wrongTarget = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: outsider.id, actionType: ModActionType.Warning, note: 'x', reportId: summary.id,
            });
            expect(wrongTarget.status).toBe(400);

            const warning = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: reported.id, actionType: ModActionType.Warning, note: 'Keep the chat friendly', reportId: summary.id,
            });
            expect(warning.status).toBe(200);

            const closed = await moderator.requestAsync('put', `/api/mod/reports/${summary.id}`, {
                status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.ActionTaken, closingNote: 'warned',
            });
            expect(closed.status).toBe(200);
            expect(closed.body.report).toEqual(jasmine.objectContaining({
                status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.ActionTaken, closedByUsername: 'moderatorUser',
            }));
            expect((await moderator.requestAsync('get', '/api/mod/reports/open-count')).body.openCount).toBe(0);
            expect((await moderator.requestAsync('get', '/api/mod/reports?status=Closed')).body.reports.map((r: { id: string }) => r.id)).toEqual([summary.id]);

            const afterClose = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: reported.id, actionType: ModActionType.Warning, note: 'again', reportId: summary.id,
            });
            expect(afterClose.status).toBe(409);

            const closedTwice = await moderator.requestAsync('put', `/api/mod/reports/${summary.id}`, {
                status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.NoAction,
            });
            expect(closedTwice.status).toBe(409);

            const reopened = await moderator.requestAsync('put', `/api/mod/reports/${summary.id}`, { status: PlayerReportStatus.Open });
            expect(reopened.status).toBe(200);
            expect(reopened.body.report.outcome).toBeUndefined();

            const reopenedDetail = await moderator.requestAsync('get', `/api/mod/reports/${summary.id}`);
            expect(reopenedDetail.body.ticketActions.map((action: { note: string }) => action.note)).toEqual(['Keep the chat friendly']);
        });

        it('rejects malformed list queries, ids and status updates', async function () {
            const moderator = contextRef.harness.createAccountClient(roles.accounts.moderator);
            const id = '7b2c5a3e-1f4d-4c8a-9e6b-2d3f4a5b6c7d';

            expect((await moderator.requestAsync('get', '/api/mod/reports?limit=0')).status).toBe(400);
            expect((await moderator.requestAsync('get', '/api/mod/reports?cursor=garbage')).status).toBe(400);
            expect((await moderator.requestAsync('get', '/api/mod/reports/not-a-uuid')).status).toBe(400);
            expect((await moderator.requestAsync('get', `/api/mod/reports/${id}`)).status).toBe(404);
            expect((await moderator.requestAsync('put', `/api/mod/reports/${id}`, { status: PlayerReportStatus.Closed })).status).toBe(400);
            expect((await moderator.requestAsync('put', `/api/mod/reports/${id}`, {
                status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.NoAction, closingNote: 'x'.repeat(2001),
            })).status).toBe(400);
            expect((await moderator.requestAsync('put', `/api/mod/reports/${id}`, { status: PlayerReportStatus.Open })).status).toBe(404);
        });
    }, { database: roles.seed, clockStart: new Date('2026-11-02T12:00:00.000Z') });

    serverIntegration(function (contextRef) {
        it('deletes the logs of a long-closed ticket in the weekly cleanup the server schedules', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            await fileReportAsync(harness, { description: 'insulted me' });
            const [reportId] = harness.db.playerReports.keys();

            // As if it had been closed in early October; the cleanup has been running weekly since
            const stored = harness.db.playerReports.get(reportId);
            stored.report = { ...stored.report, status: PlayerReportStatus.Closed, closedAt: '2026-10-01T10:00:00.000Z', outcome: PlayerReportOutcome.NoAction };
            stored.gsiKey = closedPlayerReportGsiKey('2026-10');
            harness.db.playerReportLogExpiry.set(reportId, playerReportLogExpiryGsiKey(PlayerReportService.logExpiryDay(stored.report.closedAt)));
            harness.db.playerReportCleanupCursor = { lastLogDay: '2026-10-30', lastMetadataMonth: '2025-09', lastRunAt: '2026-11-01T03:00:00.000Z' };

            // The server started on Sunday 2026-11-08 at 02:50 UTC; the weekly run is due at 03:00
            await harness.clock.advanceAsync(5 * 60 * 1000);
            expect(harness.db.playerReportLogs.has(reportId)).toBeTrue();
            await harness.clock.advanceAsync(5 * 60 * 1000);

            expect(harness.db.playerReportLogs.has(reportId)).toBeFalse();
            expect(harness.db.playerReportCleanupCursor.lastRunAt).toBe('2026-11-08T03:00:00.000Z');
            const detail = await moderator.requestAsync('get', `/api/mod/reports/${reportId}`);
            expect(detail.body.report.logsDeletedAt).toBe('2026-11-08T03:00:00.000Z');
            expect(detail.body.chatLog).toBeNull();
        });
    }, { database: roles.seed, clockStart: new Date('2026-11-08T02:50:00.000Z') });
});
