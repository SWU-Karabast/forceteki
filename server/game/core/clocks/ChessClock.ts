import type Player from '../Player';
import type { Mode } from './BasicClock';
import { BasicClock } from './BasicClock';
import type { IClock } from './IClock';

export class ChessClock extends BasicClock implements IClock {
    public override mode: Mode = 'stop';
    public override readonly name: string = 'Chess Clock';

    public constructor(player: Player, time: number) {
        super(player, time, 5);
    }

    protected override pause() {
        this.stop();
    }

    protected override restart() {
        this.start();
    }

    public override reset() {
        this.stop();
    }

    public override start() {
        if (!this.manuallyPaused) {
            if (this.mode !== 'down') {
                this.mode = 'down';
                super.start();
            }
        }
    }

    public override stop() {
        super.stop();
        this.mode = 'stop';
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override opponentStart() {}

    protected override timeRanOut() {
        this.player.game.addMessage('{0}\'s clock has run out', this.player);
        if (this.player.opponent && this.player.opponent.clock.timeLeft > 0) {
            this.player.game.endGame(this.player.opponent, 'clock');
        }
    }

    protected override updateTimeLeft(secs: number) {
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
