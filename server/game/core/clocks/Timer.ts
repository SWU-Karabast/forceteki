import { Clock, Mode } from './Clock';
import type { IClock } from './IClock';

export class Timer extends Clock implements IClock {
    mode: Mode = 'down';
    name = 'Timer';

    protected timeRanOut() {
        this.player.game.addMessage("{0}'s timer has expired", this.player);
    }
}
