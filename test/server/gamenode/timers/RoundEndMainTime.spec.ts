import { PromptType } from '../../../../server/game/core/gameSteps/PromptInterfaces';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { IPlayersAtFirstAction, ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { TestClient } from '../../../helpers/server/TestClient';

const { turnTimeMs, mainTimeMs, roundEndGrantMs } = actionTimerLimits;

const fullMainTimeSeconds = mainTimeMs / 1000;
const grantSeconds = roundEndGrantMs / 1000;

/**
 * The main time each player is given back at the end of every round, never past the full main time, and given once for
 * each round however many times an undo replays its end. The game-timer area's row T16. The cap, and a grant to a main
 * time that is counting down, are pinned at the unit level in `ByoyomiTimer`.
 */
describe('Main time given back at the end of a round', function () {
    serverIntegration(function (contextRef) {
        async function startAtFirstActionAsync(harness: ServerTestHarness): Promise<IPlayersAtFirstAction> {
            const { owner, guest } = await harness.startLiveGameAsync();
            return harness.playThroughSetupAsync(owner, guest);
        }

        /** Moves the clock through a whole turn time and then `mainSpentSeconds` of main time, which the player on the clock spends. */
        async function spendAsync(harness: ServerTestHarness, mainSpentSeconds: number): Promise<void> {
            await harness.clock.advanceAsync(turnTimeMs + mainSpentSeconds * 1000);
        }

        /** Both players pass, and skip the regroup phase's resource step, `active` last, to the next round's first action. */
        async function playToNextRoundAsync(active: TestClient, waiting: TestClient): Promise<void> {
            await active.clickButtonAsync('Pass');
            await waiting.clickButtonAsync('Pass');
            await waiting.clickButtonAsync('Skip Resourcing');
            await active.clickButtonAsync('Skip Resourcing');
            expect(active.prompt.promptType).withContext('the first action of the next round')
                .toBe(PromptType.ActionWindow);
        }

        it('gives both players 10 s back, which both are sent with the next round\'s first state', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await spendAsync(harness, 30);
            expect(waiting.mainTimeGrantOf(active)).withContext('before the end of the first round')
                .toBeNull();

            await playToNextRoundAsync(active, waiting);

            for (const viewer of [active, waiting]) {
                expect(viewer.timerOf(active).mainTimeRemainingSeconds).withContext(`as ${viewer.username} sees it`)
                    .toBe(fullMainTimeSeconds - 30 + grantSeconds);
                expect(viewer.mainTimeGrantOf(active)).toEqual({ round: 1, seconds: grantSeconds });
                expect(viewer.timerOf(waiting).mainTimeRemainingSeconds).withContext('a full main time stays full')
                    .toBe(fullMainTimeSeconds);
                expect(viewer.mainTimeGrantOf(waiting)).toEqual({ round: 1, seconds: 0 });
            }
        });

        it('gives back only what fills the main time up again', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await spendAsync(harness, 4);

            await playToNextRoundAsync(active, waiting);

            expect(waiting.timerOf(active).mainTimeRemainingSeconds).toBe(fullMainTimeSeconds);
            expect(waiting.mainTimeGrantOf(active)).toEqual({ round: 1, seconds: 4 });
        });

        it('gives time to a player still spending main time as the round ends', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await active.clickButtonAsync('Pass');
            await waiting.clickButtonAsync('Pass');
            await waiting.clickButtonAsync('Skip Resourcing');
            await spendAsync(harness, 30);
            expect(waiting.timerOf(active).turnTimeRemainingSeconds).withContext('on main time in the resource step')
                .toBeNull();

            await active.clickButtonAsync('Skip Resourcing');

            expect(waiting.timerOf(active).mainTimeRemainingSeconds).toBe(fullMainTimeSeconds - 30 + grantSeconds);
            expect(waiting.mainTimeGrantOf(active)).toEqual({ round: 1, seconds: grantSeconds });
        });

        it('gives time again at the end of every round', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await spendAsync(harness, 30);
            await playToNextRoundAsync(active, waiting);
            await spendAsync(harness, 30);

            await playToNextRoundAsync(active, waiting);

            expect(waiting.timerOf(active).mainTimeRemainingSeconds).toBe(fullMainTimeSeconds - 60 + 2 * grantSeconds);
            expect(waiting.mainTimeGrantOf(active)).toEqual({ round: 2, seconds: grantSeconds });
        });

        it('keeps the time given after an undo back before the end of the round, and gives no more when the round ends again', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await spendAsync(harness, 30);
            await playToNextRoundAsync(active, waiting);
            const mainTimeWithGrant = fullMainTimeSeconds - 30 + grantSeconds;

            await active.quickUndoAsync();
            await waiting.clickButtonAsync('Allow');

            expect(active.prompt.promptType).withContext('back in the first round\'s resource step')
                .toBe(PromptType.Resource);
            expect(waiting.timerOf(active).mainTimeRemainingSeconds).withContext('the time given is kept')
                .toBe(mainTimeWithGrant);

            await waiting.clickButtonAsync('Skip Resourcing');
            await active.clickButtonAsync('Skip Resourcing');

            expect(active.prompt.promptType).toBe(PromptType.ActionWindow);
            expect(waiting.timerOf(active).mainTimeRemainingSeconds).withContext('no more time for the same round')
                .toBe(mainTimeWithGrant);
            expect(waiting.mainTimeGrantOf(active)).toEqual({ round: 1, seconds: grantSeconds });
        });

        it('sends a spectator the time given', async function () {
            const { harness } = contextRef;
            const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
            const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
            const spectator = harness.createClient({ authenticated: true });
            expect((await spectator.spectateGameAsync(lobbyId)).status).toBe(200);
            await spectator.connectAsync({ spectator: true });
            await spendAsync(harness, 30);

            await playToNextRoundAsync(active, waiting);

            expect(spectator.timerOf(active).mainTimeRemainingSeconds).toBe(fullMainTimeSeconds - 30 + grantSeconds);
            expect(spectator.mainTimeGrantOf(active)).toEqual({ round: 1, seconds: grantSeconds });
        });

        it('gives no time once the game has ended, even if the players play on through the end of a round', async function () {
            const { harness } = contextRef;
            const { active, waiting } = await startAtFirstActionAsync(harness);
            await spendAsync(harness, 30);
            await waiting.concedeAsync();

            await playToNextRoundAsync(active, waiting);

            expect(waiting.timerOf(active).mainTimeRemainingSeconds).toBe(fullMainTimeSeconds - 30);
            expect(waiting.mainTimeGrantOf(active)).toBeNull();
            expect(waiting.mainTimeGrantOf(waiting)).toBeNull();
        });

        it('gives no time in a game that is not timed', async function () {
            const { harness } = contextRef;
            const { owner, guest } = await harness.startLiveGameAsync({}, {}, { isPrivate: true });
            const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);

            await playToNextRoundAsync(active, waiting);

            expect(waiting.mainTimeGrantOf(active)).toBeNull();
            expect(waiting.mainTimeGrantOf(waiting)).toBeNull();
        });
    }, { config: { actionTimersEnabled: true } });
});
