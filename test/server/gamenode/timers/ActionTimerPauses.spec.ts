import { PlayerTimeRemainingStatus } from '../../../../server/game/core/actionTimer/IActionTimer';
import { actionTimerLimits } from '../../../helpers/server/ActionTimerLimits';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

const { turnTimeMs } = actionTimerLimits;

/**
 * What can hold a player's action timer, and what cannot: an undo request pauses the requester's time while the
 * opponent decides, and nothing else a player sends affects it. The game-timer area's rows T9 and T12. Row T10, the
 * pause during a cost-payment recovery, is waived: it needs a board on which a cost cannot be paid.
 */
describe('Action timer pauses', function () {
    serverIntegration(function (contextRef) {
        describe('an undo request', function () {
            it('pauses the requester\'s timer while the opponent decides, and resumes it where it was if they deny it', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                await harness.clock.advanceAsync(2_000);

                await active.quickUndoAsync();

                expect(waiting.prompt.buttons.map((button) => button.text)).withContext('the opponent is asked')
                    .toContain('Deny');
                expect(waiting.timerOf(active)).withContext('the requester, paused')
                    .toEqual({ turnTimeRemainingSeconds: 18, mainTimeRemainingSeconds: 120, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: false });
                expect(waiting.timerOf(waiting)).withContext('the opponent, deciding')
                    .toEqual({ turnTimeRemainingSeconds: 20, mainTimeRemainingSeconds: 120, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });

                await harness.clock.advanceAsync(10_000);
                await waiting.clickButtonAsync('Deny');

                expect(waiting.timerOf(active)).toEqual({ turnTimeRemainingSeconds: 18, mainTimeRemainingSeconds: 120, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
                expect(waiting.timerOf(waiting).isRunning).toBeFalse();
                await harness.clock.advanceToDeadlineAsync(18_000, {
                    justBefore: () => {
                        expect(waiting.timerOf(active).turnTimeRemainingSeconds).toBe(18);
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active).turnTimeRemainingSeconds).withContext('the requester\'s main time starts')
                            .toBeNull();
                    },
                });
            });

            it('gives the requester no time back when the opponent allows it', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync();
                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                await harness.clock.advanceAsync(turnTimeMs + 30_000);

                await active.quickUndoAsync();
                await harness.clock.advanceAsync(10_000);
                await waiting.clickButtonAsync('Allow');

                expect(waiting.gameChat.map((entry) => entry.text)).toContain(`${active.username} has rolled back to their previous action`);
                expect(waiting.timerOf(active)).withContext('on the main time it had, with the 30 s spent still spent')
                    .toEqual({ turnTimeRemainingSeconds: null, mainTimeRemainingSeconds: 90, timeRemainingStatus: PlayerTimeRemainingStatus.NoAlert, isRunning: true });
            });
        });

        describe('a player\'s messages', function () {
            it('leaves a player\'s timer alone when they send anything that does not answer their prompt', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.startLiveGameAsync({ authenticated: true }, { authenticated: true });
                const { active, waiting } = await harness.playThroughSetupAsync(owner, guest);
                await harness.clock.advanceAsync(10_000);

                await active.sendGameChatAsync('one moment');
                await active.sendChatMessageAsync('still here');
                await active.typingStateAsync(true);
                await active.toggleOptionSettingAsync('autoSingleTarget', true);
                await active.reportScreenResolutionAsync(1920, 1080);
                await active.retransmitGameMessagesAsync(0, 1);
                await active.resetActionTimerAsync();
                await active.clickCardAsync(active.gameState.players[waiting.id].base.uuid);

                expect(waiting.gameChatFrom(active)).withContext('the messages arrived')
                    .toContain('one moment');
                expect(waiting.timerOf(active).turnTimeRemainingSeconds).toBe(10);
                await harness.clock.advanceToDeadlineAsync(10_000, {
                    justBefore: () => {
                        expect(waiting.timerOf(active).turnTimeRemainingSeconds).toBe(10);
                    },
                    atDeadline: () => {
                        expect(waiting.timerOf(active).turnTimeRemainingSeconds).withContext('main time starts 20 s after the action did')
                            .toBeNull();
                    },
                });
            });
        });
    }, { config: { actionTimersEnabled: true } });
});
