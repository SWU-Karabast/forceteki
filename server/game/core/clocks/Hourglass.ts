import { ChessClock } from './ChessClock';
import type { IClock } from './IClock';

export class Hourglass extends ChessClock implements IClock {
    public override readonly name = 'Hourglass';

    public override opponentStart() {
        this.mode = 'up';
        super.opponentStart();
    }
}
