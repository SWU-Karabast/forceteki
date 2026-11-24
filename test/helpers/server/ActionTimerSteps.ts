import { actionTimerLimits } from './ActionTimerLimits';
import type { IPlayersAtFirstAction, ServerTestHarness } from './ServerTestHarness';

/** Starts a public lobby's game, which is timed, and plays both players through the setup to the first action. */
export async function startTimedGameAtFirstActionAsync(harness: ServerTestHarness): Promise<IPlayersAtFirstAction> {
    const { owner, guest } = await harness.startLiveGameAsync();
    return harness.playThroughSetupAsync(owner, guest);
}

/** Moves the clock through a whole turn time and then `mainSpentSeconds` of main time, which the player on the clock spends. */
export async function spendMainTimeAsync(harness: ServerTestHarness, mainSpentSeconds: number): Promise<void> {
    await harness.clock.advanceAsync(actionTimerLimits.turnTimeMs + mainSpentSeconds * 1000);
}
