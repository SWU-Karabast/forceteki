import { PromptType } from '../../../../server/game/core/gameSteps/PromptInterfaces';
import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { IPlayersAtFirstAction, ServerTestHarness } from '../../../helpers/server/ServerTestHarness';
import { initiativeChooserOf } from '../../../helpers/server/ServerTestHarness';
import type { IActionTimerView, TestClient } from '../../../helpers/server/TestClient';

const { turnTimeMs, mainTimeMs, warningSeconds, dangerSeconds, drawMarginMs } = actionTimerLimits;

/** A timer counting down its turn time, with all its main time left. */
function onTurnTime(turnTimeRemainingSeconds: number, mainTimeRemainingSeconds = mainTimeMs / 1000): IActionTimerView {
    return { turnTimeRemainingSeconds, mainTimeRemainingSeconds, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true };
}

/** A timer that is not counting down. */
function stopped(mainTimeRemainingSeconds = mainTimeMs / 1000): IActionTimerView {
    return { turnTimeRemainingSeconds: null, mainTimeRemainingSeconds, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: false };
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

        /** Moves the clock through a whole turn time and then `mainTimeRemainingSeconds` of main time, which the player on the clock spends. */
        async function spendAsync(harness: ServerTestHarness, mainTimeRemainingSeconds: number): Promise<void> {
            await harness.clock.advanceAsync(turnTimeMs + mainTimeRemainingSeconds * 1000);
        }

        function chatOf(viewer: TestClient): string[] {
            return viewer.gameChat.map((entry) => entry.text);
        }

        describe('starting and stopping', function () {
            it('starts the turn time of the player the first prompt waits on, and leaves the other player\'s timer stopped', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { chooser, other } = initiativeChooserOf(owner, guest);

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
                const { chooser } = initiativeChooserOf(owner, guest);
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

            it('starts every action with a full turn time, even when the player\'s timer is still running from the step before', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await active.clickButtonAsync('Pass');
                await waiting.clickButtonAsync('Pass');
                await waiting.clickButtonAsync('Skip Resourcing');
                await harness.clock.advanceAsync(5_000);

                // the player with the initiative leaves the regroup phase's resource step last, their timer still running
                await active.clickButtonAsync('Skip Resourcing');

                expect(active.prompt.promptType).withContext('the first action of round 2')
                    .toBe(PromptType.ActionWindow);
                expect(waiting.timerOf(active)).toEqual(onTurnTime(20));
            });

            it('starts both players\' turn time afresh for the regroup phase\'s resource step, even the player who passed last', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await active.clickButtonAsync('Pass');
                await spendAsync(harness, 10);

                await waiting.clickButtonAsync('Pass');

                expect(waiting.prompt.promptType).toBe(PromptType.Resource);
                expect(active.timerOf(waiting)).withContext('the player who passed last, with the main time they spent')
                    .toEqual(onTurnTime(20, 110));
                expect(active.timerOf(active)).toEqual(onTurnTime(20));
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
                                .toEqual({ turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: 120, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
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
                    .toBe(PromptType.Resource);
                expect(waiting.timerOf(active)).toEqual(onTurnTime(20, 90));
                expect(waiting.timerOf(waiting)).toEqual(onTurnTime(20, 120));

                await active.clickButtonAsync('Skip Resourcing');
                await waiting.clickButtonAsync('Skip Resourcing');

                expect([active, waiting].some((player) => player.prompt.promptType === PromptType.ActionWindow))
                    .withContext('the next round')
                    .toBeTrue();
                expect(waiting.timerOf(active).mainTimeRemainingSeconds).toBe(90);
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
                                .toEqual({ turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: 30, timeRemainingStatus: PlayerTimeRemainingStatus.Warning, isRunning: true });
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
                        expect(waiting.timerOf(active).timeRemainingStatus).toBe(PlayerTimeRemainingStatus.Warning);
                        expect(chatOf(waiting)).not.toContain(danger);
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active))
                            .toEqual({ turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: 10, timeRemainingStatus: PlayerTimeRemainingStatus.Danger, isRunning: true });
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
                        expect(waiting.timerOf(active)).withContext('no main time left')
                            .toEqual(stopped(0));
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

            it('lets a waiting opponent win, however little main time they have left', async function () {
                const { harness } = contextRef;
                const { active, waiting } = await startAtFirstActionAsync(harness);
                await spendAsync(harness, 118);
                await active.clickButtonAsync('Pass');

                expect(active.timerOf(active)).withContext('waiting, with 2 s of main time')
                    .toEqual(stopped(2));
                await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);

                expect(active.gameState.winners).toEqual([active.username]);
            });

            describe('when the opponent\'s timer is running too', function () {
                /**
                 * Starts a game in which the player choosing the initiative first spends `chooserMainSpentMs` of their main
                 * time, then picks; the mulligan waits on both players, so both timers start again together. The chooser
                 * runs out first, at which point the other player is `chooserMainSpentMs` from timing out.
                 */
                async function chooserBehindByAsync(chooserMainSpentMs: number): Promise<{ chooser: TestClient; other: TestClient }> {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { chooser, other } = initiativeChooserOf(owner, guest);
                    await harness.clock.advanceAsync(turnTimeMs + chooserMainSpentMs);
                    await chooser.clickButtonAsync('Yourself');
                    expect(chooser.prompt.buttons.map((button) => button.text)).toContain('Keep');
                    return { chooser, other };
                }

                it('is a draw when the opponent is 3 s or less from timing out as well', async function () {
                    const { harness } = contextRef;
                    const { chooser, other } = await chooserBehindByAsync(drawMarginMs);

                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs - drawMarginMs);

                    expect(other.gameState.winners).toEqual(jasmine.arrayWithExactContents([chooser.username, other.username]));
                    expect(chatOf(other)).toEqual(jasmine.arrayContaining([
                        `Game ended due to ${chooser.username} timing out.`,
                        'The game ends in a draw',
                    ]));
                });

                it('lets the opponent win with more than 3 s left', async function () {
                    const { harness } = contextRef;
                    const { chooser, other } = await chooserBehindByAsync(drawMarginMs + 1);

                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs - drawMarginMs - 1);

                    expect(chatOf(other)).toContain(`Game ended due to ${chooser.username} timing out.`);
                    expect(other.gameState.winners).toEqual([other.username]);
                });

                it('is a draw when both run out at the same moment, and neither is shown with main time left', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    await initiativeChooserOf(owner, guest).chooser.clickButtonAsync('Yourself');
                    expect(owner.prompt.buttons.map((button) => button.text)).withContext('the mulligan, which waits on both')
                        .toContain('Keep');

                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);

                    expect(owner.gameState.winners).toEqual(jasmine.arrayWithExactContents([owner.username, guest.username]));
                    expect(chatOf(owner).filter((text) => text.includes('timing out')).length).withContext('one timeout ends the game')
                        .toBe(1);
                    expect(owner.timerOf(owner)).toEqual(stopped(0));
                    expect(owner.timerOf(guest)).toEqual(stopped(0));
                });

                // That the rule counts an opponent's turn time as well as their main time is pinned in `ByoyomiTimer`'s unit
                // spec: in a game without cards, both players' timers always start together, so an opponent is never still in
                // their turn time when the other runs out.
            });
        });
    }, { config: { actionTimersEnabled: true } });
});
