import { ByoyomiTimer } from './ByoyomiTimer';
import type { IByoyomiTimer } from './IByoyomiTimer';
import { PlayerTimeRemainingStatus } from './IActionTimer';

/**
 * No-op implementation of IByoyomiTimer for when timers are disabled.
 */
export class NoopActionTimer implements IByoyomiTimer {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isRunning(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isPaused(): boolean {
        return false;
    }

    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        return PlayerTimeRemainingStatus.NoAlert;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get turnTimeRemainingSeconds(): number | null {
        return null;
    }


    public get mainTimeRemainingSeconds(): number {
        // Return full main timer when disabled (no pressure on player)
        return ByoyomiTimer.MainTimeLimitSeconds;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isCountingDown(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get msUntilTimeout(): number {
        // a disabled timer never times anyone out
        return Number.POSITIVE_INFINITY;
    }

    public start() {
        return;
    }

    public stop() {
        return;
    }

    public pause() {
        return;
    }

    public resume() {
        return;
    }
}
