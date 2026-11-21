import type FormData from 'form-data';
import * as Util from '../../../../server/Util';
import { Game } from '../../../../server/game/core/Game';
import { GameErrorSeverity } from '../../../../server/game/core/Constants';
import { PlayerReportType, ReportType } from '../../../../server/game/Interfaces';
import { getDiscordEmbedFields, getDiscordFileParts } from '../../../helpers/server/DiscordWebhookForms';
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

    /**
     * Whether a report tells the dev team about errors that happened earlier in the game. These run the real
     * Discord dispatcher and read what it would post to the webhooks.
     */
    describe('earlier game errors', function () {
        const bugReportWebhookUrl = 'https://discord.invalid/bug-report-webhook';
        const serverErrorWebhookUrl = 'https://discord.invalid/server-error-webhook';

        serverIntegration(function (contextRef) {
            let posted: { url: string; form: FormData }[];

            beforeEach(function () {
                posted = [];
                spyOn(Util, 'httpPostFormData').and.callFake((url: string, form: FormData) => {
                    posted.push({ url, form });
                    return Promise.resolve('');
                });
            });

            function postsTo(url: string): FormData[] {
                return posted.filter((post) => post.url === url).map((post) => post.form);
            }

            /**
             * Makes each `menuButton` command fail inside the engine in turn: `report` has the game report the error
             * with that severity, `throw` throws it out of the command for `Lobby` to catch.
             */
            function failMenuButtonCommands(failures: { message: string; how: 'throw' | GameErrorSeverity }[]): void {
                const remaining = [...failures];
                spyOn(Game.prototype, 'menuButton').and.callFake(function (this: Game) {
                    const failure = remaining.shift();
                    const error = new Error(failure.message);
                    if (failure.how === 'throw') {
                        throw error;
                    }
                    // the spy stands in for the prototype method, so `this` is the game the command was sent to
                    // eslint-disable-next-line no-invalid-this
                    this.reportError(error, failure.how);
                    return true;
                });
            }

            it('a bug report carries the errors from earlier in the game, both reported and thrown', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                failMenuButtonCommands([
                    { message: 'reported by the engine', how: GameErrorSeverity.Normal },
                    { message: 'thrown out of a command', how: 'throw' },
                ]);

                await reporter.menuButtonAsync('arg', 'prompt-uuid');
                await reporter.menuButtonAsync('arg', 'prompt-uuid');
                await reporter.submitBugReportAsync('something went wrong earlier');

                const [bugReport] = postsTo(bugReportWebhookUrl);
                expect(getDiscordEmbedFields(bugReport)).toContain(['Game Errors', '2']);
                const errorsFile = getDiscordFileParts(bugReport).get('files[2]');
                expect(errorsFile).toContain('reported by the engine');
                expect(errorsFile).toContain('thrown out of a command');
                expect(errorsFile.indexOf('reported by the engine')).toBeLessThan(errorsFile.indexOf('thrown out of a command'));
            });

            it('a bug report from a game without errors attaches no errors file', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);

                await reporter.submitBugReportAsync('a real bug');

                const [bugReport] = postsTo(bugReportWebhookUrl);
                expect(getDiscordEmbedFields(bugReport)).toContain(['Game Errors', '0']);
                expect(getDiscordFileParts(bugReport).has('files[2]')).toBeFalse();
            });

            it('a bug report carries only the most recent 5 errors, and says how many there were', async function () {
                const { harness } = contextRef;
                const { first: reporter } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                const messages = ['error 1', 'error 2', 'error 3', 'error 4', 'error 5', 'error 6', 'error 7'];
                failMenuButtonCommands(messages.map((message) => ({ message, how: GameErrorSeverity.Normal })));

                for (const _message of messages) {
                    await reporter.menuButtonAsync('arg', 'prompt-uuid');
                }
                await reporter.submitBugReportAsync('lots went wrong');

                const errorsFile = getDiscordFileParts(postsTo(bugReportWebhookUrl)[0]).get('files[2]');
                expect(errorsFile).toMatch(/^Showing the last 5 of 7 errors/);
                expect(errorsFile).not.toContain('error 1\n');
                expect(errorsFile).not.toContain('error 2\n');
                expect(errorsFile).toContain('error 3');
                expect(errorsFile).toContain('error 7');
            });

            it('a server error report carries the earlier errors, but not the one it reports', async function () {
                const { harness } = contextRef;
                const { first: player } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                failMenuButtonCommands([
                    { message: 'an earlier error', how: GameErrorSeverity.Normal },
                    { message: 'the severe error', how: GameErrorSeverity.SevereGameMessageOnly },
                ]);

                await player.menuButtonAsync('arg', 'prompt-uuid');
                expect(postsTo(serverErrorWebhookUrl).length).toBe(0);
                await player.menuButtonAsync('arg', 'prompt-uuid');

                const [serverErrorReport] = postsTo(serverErrorWebhookUrl);
                const files = getDiscordFileParts(serverErrorReport);
                expect(files.get('files[2]')).toContain('the severe error');
                expect(getDiscordEmbedFields(serverErrorReport)).toContain(['Earlier Game Errors', '1']);
                expect(files.get('files[3]')).toContain('an earlier error');
                expect(files.get('files[3]')).not.toContain('the severe error');
            });

            it('a server error report from a game without earlier errors attaches no earlier errors file', async function () {
                const { harness } = contextRef;
                const { first: player } = await harness.startQuickGameAsync(loggedIn, loggedIn);
                failMenuButtonCommands([{ message: 'the severe error', how: GameErrorSeverity.SevereGameMessageOnly }]);

                await player.menuButtonAsync('arg', 'prompt-uuid');

                const [serverErrorReport] = postsTo(serverErrorWebhookUrl);
                expect(getDiscordEmbedFields(serverErrorReport)).toContain(['Earlier Game Errors', '0']);
                expect(getDiscordFileParts(serverErrorReport).has('files[3]')).toBeFalse();
            });
        }, { env: { DISCORD_BUG_REPORT_WEBHOOK_URL: bugReportWebhookUrl, DISCORD_ERROR_REPORT_WEBHOOK_URL: serverErrorWebhookUrl } });
    });
});
