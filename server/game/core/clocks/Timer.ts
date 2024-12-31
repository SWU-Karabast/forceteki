import type { Mode } from './BasicClock';
import { BasicClock } from './BasicClock';
import type { IClock } from './IClock';

export class Timer extends BasicClock implements IClock {
    public override mode: Mode = 'down';
    public override readonly name = 'Timer';

    protected override timeRanOut() {
        this.player.game.addMessage('{0}\'s timer has expired', this.player);
    }
}
