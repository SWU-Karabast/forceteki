import { ByoyomiTimer } from './ByoyomiTimer';
import type { IByoyomiTimer } from './IByoyomiTimer';

/**
 * No-op implementation of IByoyomiTimer for when timers are disabled.
 */
export class NoopActionTimer implements IByoyomiTimer {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isRunning(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get timeRemainingSeconds(): number | null {
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get turnTimeRemainingSeconds(): number | null {
        return null;
    }


    public get mainTimeRemainingSeconds(): number | null {
        // Return full main timer when disabled (no pressure on player)
        return ByoyomiTimer.MainTimeLimitSeconds;
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
