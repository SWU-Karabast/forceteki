import { ChessClock } from './ChessClock';
import type { ClockInterface } from './ClockInterface';

export class Hourglass extends ChessClock implements ClockInterface {
    name = 'Hourglass';

    opponentStart() {
        this.mode = 'up';
        super.opponentStart();
    }
}
