import type { IActionTimer } from './IActionTimer';

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
     * Seconds remaining on the main timer.
     */
    get mainTimeRemainingSeconds(): number | null;
}
