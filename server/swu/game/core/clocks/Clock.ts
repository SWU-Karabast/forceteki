import type Player from '../Player';
import type { ClockInterface } from './ClockInterface';

export type Mode = 'stop' | 'down' | 'up' | 'off';

export class Clock implements ClockInterface {
    mainTime: number;
    timeLeft: number;
    timerStart = 0;
    paused = false;
    stateId = 0;
    mode: Mode = 'off';
    name = 'Clock';
    manuallyPaused = false;

    constructor(protected player: Player, time: number, protected delayToStartClock?: number) {
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

    manuallyPause() {
        this.stop();
        this.manuallyPaused = true;
        this.updateStateId();
    }

    manuallyResume() {
        this.timerStart = 0;
        this.manuallyPaused = false;
        this.updateStateId();
    }

    modify(secs: number) {
        this.timeLeft += secs;
    }

    updateStateId() {
        this.stateId++;
    }
}
