import type Player from '../player';
import { ChessClock } from './ChessClock';
import type { ClockInterface } from './types';

export class Byoyomi extends ChessClock implements ClockInterface {
    name = 'Byoyomi';

    constructor(player: Player, time: number, private periods: number, private timePeriod: number) {
        super(player, time);
        this.timeLeft = time + periods * timePeriod;
    }

    reset() {
        if (this.timeLeft > 0 && this.timeLeft < this.periods * this.timePeriod) {
            this.periods = Math.ceil(this.timeLeft / this.timePeriod);
            this.timeLeft = this.periods * this.timePeriod;
        }
    }

    getState() {
        const state = super.getState();
        return Object.assign(
            {
                periods: this.periods,
                timePeriod: this.timePeriod
            },
            state
        );
    }
}
