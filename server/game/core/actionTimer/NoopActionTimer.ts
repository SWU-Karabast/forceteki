import type { IActionTimer } from './IActionTimer';
import { PlayerTimeRemainingStatus } from './IActionTimer';

export class NoopActionTimer implements IActionTimer {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isPaused(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    public get isRunning(): boolean {
        return false;
    }


    public get timeRemainingStatus(): PlayerTimeRemainingStatus {
        return PlayerTimeRemainingStatus.NoAlert;
    }

    public addSpecificTimeHandler(_timeSeconds: number, _handler: () => void) {
        return;
    }

    public start() {
        return;
    }

    public restartIfRunning() {
        return;
    }

    public pause() {
        return;
    }

    public resume() {
        return;
    }

    public stop() {
        return;
    }
}
