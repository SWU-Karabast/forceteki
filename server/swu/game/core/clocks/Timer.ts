import { Clock, Mode } from './Clock';
import type { ClockInterface } from './types';

export class Timer extends Clock implements ClockInterface {
    mode: Mode = 'down';
    name = 'Timer';

    protected timeRanOut() {
        this.player.game.addMessage("{0}'s timer has expired", this.player);
    }
}
