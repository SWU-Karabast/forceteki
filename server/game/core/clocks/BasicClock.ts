import type Player from '../Player';
import type { IClock } from './IClock';

export type Mode = 'stop' | 'down' | 'up' | 'off';

export class BasicClock implements IClock {
    public mainTime: number;
    public timeLeft: number;
    public timerStart = 0;
    public paused = false;
    public stateId = 0;
    public mode: Mode = 'off';
    public readonly name: string = 'Clock';
    public manuallyPaused = false;

    public constructor(protected player: Player, time: number, protected delayToStartClock?: number) {
        this.mainTime = time;
        this.timeLeft = time;
    }

    public getState() {
        return {
            mode: this.mode,
            timeLeft: this.timeLeft,
            stateId: this.stateId,
            mainTime: this.mainTime,
            name: this.name,
            delayToStartClock: this.delayToStartClock,
            manuallyPaused: this.manuallyPaused
        };
    }

    public opponentStart() {
        this.timerStart = Date.now();
        this.updateStateId();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public reset() {}

    public start() {
        if (!this.paused && !this.manuallyPaused) {
            this.timerStart = Date.now();
            this.updateStateId();
        }
    }

    public stop() {
        if (this.timerStart > 0) {
            this.updateTimeLeft(Math.floor((Date.now() - this.timerStart) / 1000 + 0.5));
            this.timerStart = 0;
            this.updateStateId();
        }
    }

    protected pause() {
        this.paused = true;
    }

    protected restart() {
        this.paused = false;
    }

    protected timeRanOut() {
        return;
    }

    protected updateTimeLeft(secs: number) {
        if (this.timeLeft === 0 || secs < 0) {
            return;
        }
        if (this.delayToStartClock && secs <= this.delayToStartClock) {
            return;
        }

        if (this.delayToStartClock) {
            secs = secs - this.delayToStartClock;
        }
        if (this.mode === 'down') {
            this.modify(-secs);
            if (this.timeLeft < 0) {
                this.timeLeft = 0;
                this.timeRanOut();
            }
        } else if (this.mode === 'up') {
            this.modify(secs);
        }
    }

    public manuallyPause() {
        this.stop();
        this.manuallyPaused = true;
        this.updateStateId();
    }

    public manuallyResume() {
        this.timerStart = 0;
        this.manuallyPaused = false;
        this.updateStateId();
    }

    public modify(secs: number) {
        this.timeLeft += secs;
    }

    private updateStateId() {
        this.stateId++;
    }
}
