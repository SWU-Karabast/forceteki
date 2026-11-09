import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { IPlayersAtFirstAction, ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import type { IActionTimerView, TestClient } from '../../../helpers/server/TestClient';

const { turnTimeMs, mainTimeMs, warningSeconds, dangerSeconds } = actionTimerLimits;

/** A timer counting down its turn time, with all its main time left. */
function onTurnTime(turnSeconds: number, mainSeconds = mainTimeMs / 1000): IActionTimerView {
    return { turnSeconds, mainSeconds, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true };
}

/** A timer that is not counting down. */
function stopped(mainSeconds = mainTimeMs / 1000): IActionTimerView {
    return { turnSeconds: null, mainSeconds, status: PlayerTimeRemainingStatus.NoAlert, isRunning: false };
}

/**
 * A player's action timer during a game, as both players are sent it: which prompts start and stop it, the turn time
 * each turn starts with, the main time spent once that is gone, the warnings, and running out. The game-timer area's rows
 * T2 to T8. A player's time counts down on the server; the client is sent the time left whenever the game state changes,
 * and counts down itself in between.
 */
describe('Action timer', function () {
    serverIntegration(function (contextRef) {
        async function startAtFirstActionAsync(harness: ServerTestHarness): Promise<IPlayersAtFirstAction> {
            const { owner, guest } = await harness.startLiveGameAsync();
            return harness.playThroughSetupAsync(owner, guest);
        }

        /** Has `player` spend all their turn time and `mainSeconds` of their main time on the prompt they have. */
        async function spendAsync(harness: ServerTestHarness, mainSeconds: number): Promise<void> {
            await harness.clock.advanceAsync(turnTimeMs + mainSeconds * 1000);
        }

        function chatOf(viewer: TestClient): string[] {
            return viewer.gameChat.map((entry) => entry.text);
        }

        describe('starting and stopping', function () {
            it('starts the turn time of the player the first prompt waits on, and leaves the other player\'s timer stopped', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const chooser = owner.prompt.promptType === 'initiative' ? owner : guest;
                const other = chooser === owner ? guest : owner;

                for (const viewer of [owner, guest]) {
                    expect(viewer.timerOf(chooser)).withContext(`the player choosing the initiative, as ${viewer.username} sees it`)
                        .toEqual(onTurnTime(20));
                    expect(viewer.timerOf(other)).withContext(`the other player, as ${viewer.username} sees it`)
                        .toEqual(stopped());
                }
            });

            it('starts both players\' turn time for a prompt that waits on both, such as the mulligan', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const chooser = owner.prompt.promptType === 'initiative' ? owner : guest;
                await harness.clock.advanceAsync(5_000);

                await chooser.clickButtonAsync('Yourself');

                expect(owner.prompt.buttons.map((button) => button.text)).toContain('Keep');
                expect(owner.timerOf(owner)).withContext('the chooser\'s time starts again')
                    .toEqual(onTurnTime(20));
                expect(owner.timerOf(guest)).toEqual(onTurnTime(20));
            });

            it('starts the active player\'s turn time for their action, and stops it when they pass', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);

                expect(waiting.timerOf(active)).toEqual(onTurnTime(20));
                expect(waiting.timerOf(waiting)).toEqual(stopped());

                await harness.clock.advanceAsync(5_000);
                await active.clickButtonAsync('Pass');

                for (const viewer of [active, waiting]) {
                    expect(viewer.timerOf(active)).withContext(`the player who passed, as ${viewer.username} sees it`)
                        .toEqual(stopped());
                    expect(viewer.timerOf(waiting)).withContext(`the player now acting, as ${viewer.username} sees it`)
                        .toEqual(onTurnTime(20));
                }
            });
        });

        describe('turn time and main time', function () {
            it('starts the main time when the turn time runs out, and sends both players the game state at that moment', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                const statesSent = () => [active, waiting].map((player) => player.receivedEvents('gamestate').length);
                const statesBefore = statesSent();

                await harness.clock.advanceToDeadlineAsync(turnTimeMs, {
                    justBefore: () => {
                        expect(statesSent()).withContext('nothing sent while the turn time counts down')
                            .toEqual(statesBefore);
                    },
                    atDeadline: () => {
                        expect(statesSent()).toEqual(statesBefore.map((count) => count + 1));
                        for (const viewer of [active, waiting]) {
                            expect(viewer.timerOf(active)).withContext(`as ${viewer.username} sees it`)
                                .toEqual({ turnSeconds: null, mainSeconds: 120, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                        }
                    },
                });
            });

            it('keeps the main time a player has spent for the rest of the game, giving each new turn its turn time again', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await spendAsync(harness, 30);
                await active.clickButtonAsync('Pass');

                expect(waiting.timerOf(active)).withContext('while the opponent acts')
                    .toEqual(stopped(90));

                await waiting.clickButtonAsync('Pass');

                expect(active.prompt.promptType).withContext('the regroup phase')
                    .toBe('resource');
                expect(waiting.timerOf(active)).toEqual(onTurnTime(20, 90));
                expect(waiting.timerOf(waiting)).toEqual(onTurnTime(20, 120));

                await active.clickButtonAsync('Skip Resourcing');
                await waiting.clickButtonAsync('Skip Resourcing');

                expect([active, waiting].some((player) => player.prompt.promptType === 'actionWindow'))
                    .withContext('the next round')
                    .toBeTrue();
                expect(waiting.timerOf(active).mainSeconds).toBe(90);
            });
        });

        describe('warnings', function () {
            it('warns at 30 s of main time left: the timer shows it, the chat says so, and both players are sent it then', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                const warning = `${active.username} has 30 seconds of main time remaining.`;
                await harness.clock.advanceAsync(turnTimeMs);

                await harness.clock.advanceToDeadlineAsync(mainTimeMs - warningSeconds * 1000, {
                    justBefore: () => {
                        expect(chatOf(waiting)).not.toContain(warning);
                    },
                    atDeadline: () => {
                        for (const viewer of [active, waiting]) {
                            expect(viewer.timerOf(active)).withContext(`as ${viewer.username} sees it`)
                                .toEqual({ turnSeconds: null, mainSeconds: 30, status: PlayerTimeRemainingStatus.Warning, isRunning: true });
                            expect(chatOf(viewer)).toContain(warning);
                        }
                    },
                });
            });

            it('shows danger at 10 s of main time left, and the chat says so', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                const danger = `${active.username} has 10 seconds of main time remaining.`;
                await spendAsync(harness, (mainTimeMs / 1000) - warningSeconds);

                await harness.clock.advanceToDeadlineAsync((warningSeconds - dangerSeconds) * 1000, {
                    justBefore: () => {
                        expect(waiting.timerOf(active).status).toBe(PlayerTimeRemainingStatus.Warning);
                        expect(chatOf(waiting)).not.toContain(danger);
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active))
                            .toEqual({ turnSeconds: null, mainSeconds: 10, status: PlayerTimeRemainingStatus.Danger, isRunning: true });
                        expect(chatOf(waiting)).toContain(danger);
                    },
                });
            });

            it('clears the warning once the player is no longer spending main time, even with little left', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await spendAsync(harness, (mainTimeMs / 1000) - warningSeconds);

                await active.clickButtonAsync('Pass');

                expect(waiting.timerOf(active)).withContext('while the opponent acts')
                    .toEqual(stopped(30));

                await waiting.clickButtonAsync('Pass');

                expect(waiting.timerOf(active)).withContext('on their next turn\'s turn time')
                    .toEqual(onTurnTime(20, 30));
            });
        });

        describe('running out', function () {
            it('ends the game for the opponent when the active player\'s main time runs out', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);

                await harness.clock.advanceToDeadlineAsync(turnTimeMs + mainTimeMs, {
                    justBefore: () => {
                        expect(waiting.gameState.winners).toEqual([]);
                    },
                    atDeadline: () => {
                        for (const viewer of [active, waiting]) {
                            expect(viewer.gameState.winners).withContext(`as ${viewer.username} sees it`)
                                .toEqual([waiting.username]);
                            expect(chatOf(viewer)).toEqual(jasmine.arrayContaining([
                                `Game ended due to ${active.username} timing out.`,
                                `${waiting.username} has won the game`,
                            ]));
                        }
                        expect(waiting.timerOf(waiting).isRunning).toBeFalse();
                        expect(waiting.timerOf(active).isRunning).toBeFalse();
                    },
                });
            });

            it('ends the game for an opponent whose own timer is running, with more than 3 s left, and stops it', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await spendAsync(harness, 90);
                await active.clickButtonAsync('Pass');
                await waiting.clickButtonAsync('Pass');

                // in the regroup phase's resource step both timers run: the active player has 30 s of main time left
                expect(waiting.timerOf(waiting)).toEqual(onTurnTime(20, 120));

                await harness.clock.advanceToDeadlineAsync(turnTimeMs + 30_000, {
                    justBefore: () => {
                        expect(waiting.gameState.winners).toEqual([]);
                    },
                    atDeadline: () => {
                        expect(waiting.gameState.winners).toEqual([waiting.username]);
                        expect(chatOf(waiting)).toContain(`Game ended due to ${active.username} timing out.`);
                        expect(waiting.timerOf(waiting).isRunning).withContext('the opponent\'s timer stops')
                            .toBeFalse();
                    },
                });
            });

            // TODO (open finding #16): when a player's main time runs out, it should be a draw only if the opponent's
            // timer is running and they are 3 s or less from running out too, counting turn and main time. Add specs for:
            // - a waiting opponent with under 3 s of main time left wins (today it is a draw);
            // - a running opponent 3 s or less from running out draws, either side of the 3 s boundary, including one
            //   still in their turn time (row T7);
            // - both players running out at the same moment, at a prompt that waits on both, is a draw, and neither is
            //   then shown with main time left (row T8; today the first player loses and both show 120 s).
        });
    }, { config: { actionTimersEnabled: true } });
});
