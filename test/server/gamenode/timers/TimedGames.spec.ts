import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { QuickUndoAvailableState } from '../../../../server/game/core/snapshot/SnapshotInterfaces';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import { initiativeChooserOf } from '../../../helpers/server/ServerTestHarness';

const { turnTimeMs, mainTimeMs } = actionTimerLimits;

/** A timer that is not counting down, with all its main time: how a game that is not timed shows every player's. */
const notTimed = { turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: mainTimeMs / 1000, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: false };

/**
 * Which games have action timers, and the timer around the game rather than within it: the end of the game (including an
 * undo request still open when it ends), a reconnect, and spectators. The game-timer area's rows T1, T11 and T13. Shutdown with timers running is
 * row T14, in `GameServerScheduling`.
 */
describe('Timed games', function () {
    describe('on a node with action timers on', function () {
        serverIntegration(function (contextRef) {
            describe('which games are timed', function () {
                it('times a public lobby\'s game', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();

                    expect(owner.timerOf(initiativeChooserOf(owner, guest).chooser).isRunning).toBeTrue();
                });

                it('times a quick match', async function () {
                    const { harness } = contextRef;
                    const { first, second } = await harness.startQuickGameAsync();

                    expect(first.timerOf(initiativeChooserOf(first, second).chooser).isRunning).toBeTrue();
                });

                it('does not time a private lobby\'s game', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync({}, {}, { isPrivate: true });

                    expect(owner.timerOf(owner)).toEqual(notTimed);
                    expect(owner.timerOf(guest)).toEqual(notTimed);
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(owner.gameState.winners).withContext('no one runs out of time')
                        .toEqual([]);
                });
            });

            describe('the end of a game', function () {
                it('times no one out once the game has ended, even if the players play on', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                    await waiting.concedeAsync();
                    const statesAtTheEnd = active.receivedEvents('gamestate').length;

                    expect(active.prompt.buttons.map((button) => button.text)).withContext('play goes on')
                        .toContain('Pass');
                    await harness.clock.advanceAsync(turnTimeMs);
                    expect(active.receivedEvents('gamestate').length).withContext('nothing sent when the turn time runs out')
                        .toBe(statesAtTheEnd);

                    await harness.clock.advanceAsync(mainTimeMs);
                    expect(active.gameState.winners).toEqual([active.username]);
                    expect(active.gameChat.map((entry) => entry.text).some((text) => text.includes('timing out'))).toBeFalse();
                });

                it('stops both timers when the game ends, and starts neither while the players play on', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                    await harness.clock.advanceAsync(5_000);

                    await waiting.concedeAsync();

                    expect(active.timerOf(active)).toEqual(notTimed);
                    expect(active.timerOf(waiting)).toEqual(notTimed);

                    await active.clickButtonAsync('Pass');
                    const statesWhilePlayingOn = active.receivedEvents('gamestate').length;

                    expect(waiting.prompt.buttons.map((button) => button.text)).withContext('play goes on')
                        .toContain('Pass');
                    expect(active.timerOf(waiting)).toEqual(notTimed);
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(active.receivedEvents('gamestate').length).withContext('nothing sent by a timer')
                        .toBe(statesWhilePlayingOn);
                    expect(active.gameChat.map((entry) => entry.text).some((text) => text.includes('main time remaining'))).toBeFalse();
                });

                it('keeps the game over and both timers stopped when an undo request is allowed after the requesting player has left', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);

                    // spend the active player's free undo, so that their next one is a request
                    await active.clickButtonAsync('Pass');
                    await active.quickUndoAsync();
                    await active.clickButtonAsync('Pass');
                    await active.quickUndoAsync();
                    expect(waiting.prompt.buttons.map((button) => button.text)).toContain('Allow');

                    await active.manualDisconnectAsync();
                    expect(waiting.gameState.winners).toEqual([waiting.username]);

                    await waiting.clickButtonAsync('Allow');

                    expect(waiting.gameState.winners).withContext('the game stays over')
                        .toEqual([waiting.username]);
                    expect(waiting.timerOf(active)).toEqual(notTimed);
                    expect(waiting.timerOf(waiting)).toEqual(notTimed);
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(waiting.gameChat.map((entry) => entry.text).some((text) => text.includes('main time remaining'))).toBeFalse();
                });

                it('keeps the game over and both timers stopped when the player deciding on an undo request runs out of time, then allows it', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);

                    // spend the active player's free undo, so that their next one is a request
                    await active.clickButtonAsync('Pass');
                    await active.quickUndoAsync();
                    await active.clickButtonAsync('Pass');
                    await active.quickUndoAsync();
                    expect(waiting.prompt.buttons.map((button) => button.text)).toContain('Allow');

                    // the deciding player's timer keeps running while the request is open
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(waiting.gameState.winners).toEqual([active.username]);

                    await waiting.clickButtonAsync('Allow');

                    expect(waiting.gameState.winners).withContext('the game stays over')
                        .toEqual([active.username]);
                    expect(waiting.gameChat.map((entry) => entry.text).some((text) => text.includes('can no longer be allowed'))).toBeTrue();
                    expect(waiting.timerOf(active).isRunning).toBeFalse();
                    expect(waiting.timerOf(waiting).isRunning).toBeFalse();
                    const statesAfterAllowing = waiting.receivedEvents('gamestate').length;
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(waiting.receivedEvents('gamestate').length).withContext('nothing sent by a timer')
                        .toBe(statesAfterAllowing);
                });

                it('refuses an undo request once a player has run out of time', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                    await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                    expect(waiting.gameState.winners).toEqual([waiting.username]);
                    expect(active.gameState.players[active.id].availableSnapshots.quickSnapshotAvailable).withContext('no undo offered')
                        .toBe(QuickUndoAvailableState.NoSnapshotAvailable);

                    await active.quickUndoAsync();

                    expect(waiting.prompt.buttons.map((button) => button.text)).not.toContain('Allow');
                    expect(waiting.gameState.winners).withContext('the game stays over')
                        .toEqual([waiting.username]);
                });
            });

            describe('reconnects and spectators', function () {
                it('keeps a player\'s time across a reconnect', async function () {
                    const { harness } = contextRef;
                    const { owner, guest } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                    await harness.clock.advanceAsync(10_000);

                    await active.disconnectTransportAsync();
                    await harness.clock.advanceAsync(5_000);
                    await active.connectAsync();

                    expect(active.timerOf(active)).withContext('as the new socket is sent it')
                        .toEqual({ turnTimeRemainingSeconds: 5, mainTimeRemainingSeconds: 120, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                    await harness.clock.advanceToDeadlineAsync(5_000, {
                        justBefore: () => {
                            expect(waiting.timerOf(active).turnTimeRemainingSeconds).not.toBeNull();
                        },
                        atDeadline: () => {
                            expect(waiting.timerOf(active).turnTimeRemainingSeconds).toBeNull();
                        },
                    });
                });

                it('sends a spectator who joins mid-turn both players\' timers as they stand then', async function () {
                    const { harness } = contextRef;
                    const { owner, guest, lobbyId } = await harness.startLiveGameAsync();
                    const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                    await harness.clock.advanceAsync(turnTimeMs + 5_000);
                    const spectator = harness.createClient({ authenticated: true });
                    expect((await spectator.spectateGameAsync(lobbyId)).status).toBe(200);

                    await spectator.connectAsync({ spectator: true });

                    expect(spectator.timerOf(active))
                        .toEqual({ turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: 115, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                    expect(spectator.timerOf(waiting)).toEqual(notTimed);
                });
            });
        }, { config: { actionTimersEnabled: true } });
    });

    describe('on a node with action timers off', function () {
        serverIntegration(function (contextRef) {
            it('does not time a public lobby\'s game', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();

                expect(owner.timerOf(owner)).toEqual(notTimed);
                expect(owner.timerOf(guest)).toEqual(notTimed);
                await harness.clock.advanceAsync(turnTimeMs + mainTimeMs);
                expect(owner.gameState.winners).toEqual([]);
            });
        });
    });
});
