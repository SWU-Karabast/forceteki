import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../helpers/server/TestClient';

const { turnTimeMs, mainTimeMs } = actionTimerLimits;

const notTimed = { turnSeconds: null, mainSeconds: 120, status: PlayerTimeRemainingStatus.NoAlert, isRunning: false };

/** Whichever of `players` the first prompt waits on: the one choosing the initiative. */
function chooserOf(players: TestClient[]): TestClient {
    return players.find((player) => player.prompt.promptType === 'initiative');
}

/**
 * Which games have action timers, and the timer around the game rather than within it: the end of the game, a
 * reconnect, and spectators. The game-timer area's rows T1, T11 and T13. Shutdown with timers running is row T14, in
 * `GameServerScheduling`.
 */
describe('Timed games', function () {
    describe('on a node with action timers on', function () {
        serverIntegration(function (contextRef) {
            it('times a public lobby\'s game', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();

                expect(owner.timerOf(chooserOf([owner, guest])).isRunning).toBeTrue();
            });

            it('times a quick match', async function () {
                const { harness } = contextRef;
                const { first, second } = await harness.startQuickGameAsync();

                expect(first.timerOf(chooserOf([first, second])).isRunning).toBeTrue();
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

            // TODO (open finding #18): once the game has ended, no prompt should start a timer, so the client is not
            // shown one running and the chat gets no main-time warnings (row T11). Add specs that both timers are
            // stopped after a concession and stay stopped when the players play on.

            it('picks the timers back up when an undo takes the game back before its end', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                await harness.clock.advanceAsync(turnTimeMs + 10_000);
                await active.concedeAsync();

                await active.quickUndoAsync();
                await waiting.clickButtonAsync('Allow');

                expect(waiting.gameState.winners).withContext('the game goes on')
                    .toEqual([]);
                expect(waiting.timerOf(active))
                    .toEqual({ turnSeconds: 20, mainSeconds: 110, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                expect(waiting.timerOf(waiting))
                    .toEqual({ turnSeconds: 20, mainSeconds: 120, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                await harness.clock.advanceToDeadlineAsync(turnTimeMs, {
                    justBefore: () => {
                        expect(waiting.timerOf(active).turnSeconds).toBe(20);
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active)).withContext('the main time spent before the end stays spent')
                            .toEqual({ turnSeconds: null, mainSeconds: 110, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                    },
                });
            });

            it('keeps a player\'s time across a reconnect', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                await harness.clock.advanceAsync(10_000);

                await active.disconnectTransportAsync();
                await harness.clock.advanceAsync(5_000);
                await active.connectAsync();

                expect(active.timerOf(active)).withContext('as the new socket is sent it')
                    .toEqual({ turnSeconds: 5, mainSeconds: 120, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                await harness.clock.advanceToDeadlineAsync(5_000, {
                    justBefore: () => {
                        expect(waiting.timerOf(active).turnSeconds).not.toBeNull();
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active).turnSeconds).toBeNull();
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
                    .toEqual({ turnSeconds: null, mainSeconds: 115, status: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                expect(spectator.timerOf(waiting)).toEqual(notTimed);
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
