import Player from '../Player';
import { Clock, Mode } from './Clock';
import type { ClockInterface } from './ClockInterface';

export class ChessClock extends Clock implements ClockInterface {
    mode: Mode = 'stop';
    name = 'Chess Clock';

    constructor(player: Player, time: number) {
        super(player, time, 5);
    }

    protected pause() {
        this.stop();
    }

    protected restart() {
        this.start();
    }

    public reset() {
        this.stop();
    }

    public start() {
        if (!this.manuallyPaused) {
            if (this.mode !== 'down') {
                this.mode = 'down';
                super.start();
            }
        }
    }

    public stop() {
        super.stop();
        this.mode = 'stop';
    }

    public opponentStart() {}

    protected timeRanOut() {
        this.player.game.addMessage("{0}'s clock has run out", this.player);
        if (this.player.opponent && this.player.opponent.clock.timeLeft > 0) {
            this.player.game.recordWinner(this.player.opponent, 'clock');
        }
    }

    protected updateTimeLeft(secs: number) {
        if (this.timeLeft === 0 || secs < 0) {
            return;
        }
        if (secs <= this.delayToStartClock) {
            return;
        }

        secs = secs - this.delayToStartClock;
        if (this.mode === 'down') {
            this.modify(-secs);
            if (this.timeLeft < 0) {
                this.timeLeft = 0;
                this.timeRanOut();
            }
        } else if (this.mode === 'up') {
            this.modify(secs);
        }
    }
}
