import { ChessClock } from './ChessClock';
import type { IClock } from './IClock';

export class Hourglass extends ChessClock implements IClock {
    override name = 'Hourglass';

    override opponentStart() {
        this.mode = 'up';
        super.opponentStart();
    }
}
