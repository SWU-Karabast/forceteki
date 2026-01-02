import type { IByoyomiTimer } from './IByoyomiTimer';

/** Time limit for main timer buffer in seconds (used for default value) */
const MAIN_TIME_LIMIT_SECONDS = 150;

/**
 * No-op implementation of IByoyomiTimer for when timers are disabled.
 */
export class NoopActionTimer implements IByoyomiTimer {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isRunning(): boolean {
        return false;
    }

    public get timeRemainingSeconds(): number | null {
        return null;
    }

    public get turnTimeRemainingSeconds(): number | null {
        return null;
    }


    public get mainTimeRemainingSeconds(): number | null {
        // Return full main timer when disabled (no pressure on player)
        return MAIN_TIME_LIMIT_SECONDS;
    }

    public start() {
        return;
    }

    public restartIfRunning() {
        return;
    }

    public stop() {
        return;
    }
}
