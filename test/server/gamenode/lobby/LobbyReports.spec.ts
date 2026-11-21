import { PlayerReportType, ReportType } from '../../../../server/game/Interfaces';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { ITestClientOptions, TestClient } from '../../../helpers/server/TestClient';

const loggedIn: ITestClientOptions = { authenticated: true };

interface ICapturedDiscordReport {
    reportType: ReportType;
    formatArgs: unknown[];
}

/**
 * The client only offers bug and player reports to logged-in players, and player reports only against
 * logged-in opponents; these check the server enforces the same.
 */
describe('Lobby reports', function () {
    serverIntegration(function (contextRef) {
        /**
         * Swaps the reporter's lobby's Discord dispatcher for one that records the reports it would send.
         * With `discordDown`, every send fails the way a rejected webhook call does.
         */
        function captureDiscordReports(harness: ServerTestHarness, reporter: TestClient, { discordDown = false } = {}): ICapturedDiscordReport[] {
            const sent: ICapturedDiscordReport[] = [];

            // `Lobby` builds its own `DiscordDispatcher`, so the only way to intercept it is to overwrite the private
            // field. This is the one remaining reach into private state in this suite; it goes when the dispatcher
            // can be injected (backlog item I-2 in long-term-project-docs/game-node-test-suite.md).
            // eslint-disable-next-line no-restricted-syntax
            const lobby = harness.server.testLobbyFor(reporter.id) as any;
            lobby.discordDispatcher = {
                formatReport: (...formatArgs: unknown[]) => ({ formatArgs }),
                formatAndSendReportAsync: (report: { formatArgs: unknown[] }, reportType: ReportType) => {
                    if (discordDown) {
                        return Promise.reject(new Error('webhook unavailable'));
                    }
                    sent.push({ reportType, formatArgs: report.formatArgs });
                    return Promise.resolve(true);
                },
            };
            return sent;
        }

        function playerReportResults(reporter: TestClient): boolean[] {
            return reporter.receivedEvents('playerReportResult').map((e) => e.args[0].success);
        }

        it('forwards a bug report between two logged-in players', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
            const sent = captureDiscordReports(harness, reporter);

            await reporter.submitBugReportAsync('a real bug');

            expect(sent.map((report) => report.reportType)).toEqual([ReportType.BugReport]);
        });

        // While the mod tools dashboard rolls out, Discord keeps getting every player report as a backup
        describe('a player report, stored for the mod tools and sent to Discord as a backup,', function () {
            it('goes to both, the Discord copy with the offense and the chat', async function () {
                const { harness } = contextRef;
                const { first: reporter, second: reported } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                const sent = captureDiscordReports(harness, reporter);

                await reported.sendGameMessageAsync('chat', 'you are terrible');
                await reporter.submitPlayerReportAsync('they were rude', PlayerReportType.ChatHarrasment);

                expect(playerReportResults(reporter)).toEqual([true]);
                expect(harness.db.playerReports.size).toBe(1);
                expect(sent.map((report) => report.reportType)).toEqual([ReportType.PlayerReport]);
                // formatReport(description, gameState, playerReportType, user, opponent, messages, ..., chatMessages)
                const [description, , offense, , opponent, , , , , , , , , chatMessages] = sent[0].formatArgs;
                expect(description).toBe('they were rude');
                expect(offense).toBe(PlayerReportType.ChatHarrasment);
                expect(opponent).toEqual(jasmine.objectContaining({ id: reported.id }));
                expect(JSON.stringify(chatMessages)).toContain('you are terrible');
            });

            it('is still stored when Discord is down', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                captureDiscordReports(harness, reporter, { discordDown: true });

                await reporter.submitPlayerReportAsync('they were rude', PlayerReportType.ChatHarrasment);

                expect(playerReportResults(reporter)).toEqual([true]);
                expect(harness.db.playerReports.size).toBe(1);
            });

            it('still reaches Discord when it cannot be stored', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                const sent = captureDiscordReports(harness, reporter);
                harness.db.failPlayerReportSaves = true;

                await reporter.submitPlayerReportAsync('they were rude', PlayerReportType.ChatHarrasment);

                expect(playerReportResults(reporter)).toEqual([true]);
                expect(sent.length).toBe(1);
                expect(harness.db.playerReports.size).toBe(0);
            });

            it('fails when it can neither be stored nor sent to Discord', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                captureDiscordReports(harness, reporter, { discordDown: true });
                harness.db.failPlayerReportSaves = true;

                await reporter.submitPlayerReportAsync('they were rude', PlayerReportType.ChatHarrasment);

                expect(playerReportResults(reporter)).toEqual([false]);
            });
        });

        it('tells the game chat who sent a report, naming them as a player part rather than in the text', async function () {
            const { harness } = contextRef;
            const { first: reporter, second: opponent } = await harness.startQuickGameAsync({ ...loggedIn, username: 'Alice' }, loggedIn);
            captureDiscordReports(harness, reporter);

            await reporter.submitBugReportAsync('a real bug');

            // a client finds a player part by id, so it can show a spectator the player's seat rather than their name
            expect(opponent.gameChat).toContain(jasmine.objectContaining({
                text: 'Alice has submitted a bug report',
                playerIds: [reporter.id],
            }));
        });

        it('drops a bug report from an anonymous player', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync({}, loggedIn);
            const sent = captureDiscordReports(harness, reporter);

            await reporter.submitBugReportAsync('spam');

            expect(sent.length).toBe(0);
            expect(reporter.receivedEvents('bugReportResult').map((e) => e.args[0].success)).toEqual([false]);
        });

        it('drops a player report against an anonymous opponent', async function () {
            const { harness } = contextRef;
            const { first: reporter } = await harness.startQuickGameAsync(loggedIn, {});
            const sent = captureDiscordReports(harness, reporter);

            await reporter.submitPlayerReportAsync('they were rude', PlayerReportType.ChatHarrasment);

            expect(sent.length).toBe(0);
            expect(harness.db.playerReports.size).toBe(0);
            expect(playerReportResults(reporter)).toEqual([false]);
        });
    });
});
