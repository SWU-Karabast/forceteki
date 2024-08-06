import { ChessClock } from './ChessClock';
import type { ClockInterface } from './types';

export class Hourglass extends ChessClock implements ClockInterface {
    name = 'Hourglass';

    opponentStart() {
        this.mode = 'up';
        super.opponentStart();
    }
}
