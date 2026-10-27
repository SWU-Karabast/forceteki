import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * The client only offers bug and player reports to logged-in players, and player reports only against
 * logged-in opponents; these check the server enforces the same.
 */
describe('Lobby reports', function () {
    serverIntegration(function (contextRef) {
        /** Swaps the reporter's lobby's Discord dispatcher for one that records the reports it would send. */
        function captureDiscordReports(harness: ServerTestHarness, reporter: TestClient): unknown[] {
            const sent: unknown[] = [];

            // `Lobby` builds its own `DiscordDispatcher`, so the only way to intercept it is to overwrite the private
            // field. This is the one remaining reach into private state in this suite; it goes when the dispatcher
            // can be injected (backlog item I-2 in long-term-project-docs/game-node-test-suite.md).
            // eslint-disable-next-line no-restricted-syntax
            const lobby = harness.server.testLobbyFor(reporter.id) as any;
            lobby.discordDispatcher = {
                formatReport: (...args: unknown[]) => ({ args }),
                formatAndSendReportAsync: (report: unknown) => {
                    sent.push(report);
                    return Promise.resolve(true);
                },
            };
            return sent;
        }

        it('forwards a bug report between two logged-in players', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
            const sent = captureDiscordReports(harness, reporter);

            await reporter.sendLobbyMessageAsync('submitReport', 'bugReport', 'a real bug');

            expect(sent.length).toBe(1);
        });

        it('drops a bug report from an anonymous player', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync({}, loggedIn);
            const sent = captureDiscordReports(harness, reporter);

            await reporter.sendLobbyMessageAsync('submitReport', 'bugReport', 'spam');

            expect(sent.length).toBe(0);
            expect(reporter.receivedEvents('bugReportResult').map((e) => e.args[0].success)).toEqual([false]);
        });

        it('drops a player report against an anonymous opponent', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync(loggedIn, {});
            const sent = captureDiscordReports(harness, reporter);

            await reporter.sendLobbyMessageAsync('submitReport', 'playerReport', 'they were rude', 'Harassment');

            expect(sent.length).toBe(0);
            expect(reporter.receivedEvents('playerReportResult').map((e) => e.args[0].success)).toEqual([false]);
        });
    }, { database: true });
});
