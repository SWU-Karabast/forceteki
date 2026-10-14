import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../helpers/server/TestClient';

const matchConfig = {
    format: SwuGameFormat.Premier,
    cardPool: CardPool.Current,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * The client only offers bug and player reports to logged-in players, and player reports only against
 * logged-in opponents; these check the server enforces the same.
 */
describe('Lobby reports', function () {
    serverIntegration(function (contextRef) {
        /** Both players queue for a quick match and are taken through to a started game. */
        async function setUpGameAsync(
            harness: ServerTestHarness,
            reporterOptions: ITestClientOptions,
            opponentOptions: ITestClientOptions
        ): Promise<TestClient> {
            const reporter = harness.createClient(reporterOptions);
            const opponent = harness.createClient(opponentOptions);
            for (const client of [reporter, opponent]) {
                await client.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...matchConfig });
                await client.connectAsync();
            }

            await harness.clock.advanceAsync(6_000);
            expect(reporter.gameState).toBeDefined();

            return reporter;
        }

        /** Swaps the only lobby's Discord dispatcher for one that records the reports it would send. */
        function captureDiscordReports(harness: ServerTestHarness): unknown[] {
            const sent: unknown[] = [];
            const lobby = Array.from((harness.server as any).lobbies.values())[0] as any;
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
            const reporter = await setUpGameAsync(harness, loggedIn, loggedIn);
            const sent = captureDiscordReports(harness);

            await reporter.sendLobbyMessageAsync('submitReport', 'bugReport', 'a real bug');

            expect(sent.length).toBe(1);
        });

        it('drops a bug report from an anonymous player', async function () {
            const { harness } = contextRef;
            const reporter = await setUpGameAsync(harness, {}, loggedIn);
            const sent = captureDiscordReports(harness);

            await reporter.sendLobbyMessageAsync('submitReport', 'bugReport', 'spam');

            expect(sent.length).toBe(0);
            expect(reporter.receivedEvents('bugReportResult').map((e) => e.args[0].success)).toEqual([false]);
        });

        it('drops a player report against an anonymous opponent', async function () {
            const { harness } = contextRef;
            const reporter = await setUpGameAsync(harness, loggedIn, {});
            const sent = captureDiscordReports(harness);

            await reporter.sendLobbyMessageAsync('submitReport', 'playerReport', 'they were rude', 'Harassment');

            expect(sent.length).toBe(0);
            expect(reporter.receivedEvents('playerReportResult').map((e) => e.args[0].success)).toEqual([false]);
        });
    });
});
