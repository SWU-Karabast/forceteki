import type { IActionTimer, PlayerTimeRemainingStatus } from './IActionTimer';

/**
 * Interface for a two-stage "byoyomi" style timer.
 * - Turn timer: Short timer that resets on each new prompt
 * - Main timer: Buffer time that starts ticking when turn timer expires
 *
 * When the turn timer expires, the main timer becomes active.
 * When the main timer expires, the player times out.
 */
export interface IByoyomiTimer extends IActionTimer {

    /**
     * Seconds remaining on the turn timer, or null if main timer is active.
     */
    get turnTimeRemainingSeconds(): number | null;

    /**
     * Seconds remaining on the main timer. Always has a value.
     */
    get mainTimeRemainingSeconds(): number;

    /**
     * Whether the player is on the clock: their time running, or running out at this very moment. False while stopped
     * (including once their timeout has been handled and the timer stopped) or paused.
     */
    get isCountingDown(): boolean;

    /**
     * Milliseconds until the player times out if their timer keeps running: the turn time left (unless it is spent) and
     * the main time left. In milliseconds so that the two are added before any rounding, and a run-out timer counts as 0;
     * see `SimpleActionTimer.timeRemainingMs`.
     */
    get msUntilTimeout(): number;

    /**
     * Current warning status of the main timer. NoAlert while the player isn't actively
     * burning main time; transitions to Warning/Danger as main time runs low.
     */
    get timeRemainingStatus(): PlayerTimeRemainingStatus;
}
