import type Player from '../Player';
import { ChessClock } from './ChessClock';
import type { IClock } from './IClock';

export class Byoyomi extends ChessClock implements IClock {
    override name = 'Byoyomi';

    constructor(player: Player, time: number, private periods: number, private timePeriod: number) {
        super(player, time);
        this.timeLeft = time + periods * timePeriod;
    }

    override reset() {
        if (this.timeLeft > 0 && this.timeLeft < this.periods * this.timePeriod) {
            this.periods = Math.ceil(this.timeLeft / this.timePeriod);
            this.timeLeft = this.periods * this.timePeriod;
        }
    }

    override getState() {
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
