import { ChessClock } from './ChessClock';
import type { IClock } from './IClock';

export class Hourglass extends ChessClock implements IClock {
    name = 'Hourglass';

    opponentStart() {
        this.mode = 'up';
        super.opponentStart();
    }
}
