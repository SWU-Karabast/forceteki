import { BasicClock, Mode } from './BasicClock';
import type { IClock } from './IClock';

export class Timer extends BasicClock implements IClock {
    override mode: Mode = 'down';
    override name = 'Timer';

    protected override timeRanOut() {
        this.player.game.addMessage('{0}\'s timer has expired', this.player);
    }
}
