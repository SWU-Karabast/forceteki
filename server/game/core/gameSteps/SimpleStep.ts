import type Game from '../Game';
import { BaseStep } from './BaseStep';

export class SimpleStep extends BaseStep {
    public constructor(game: Game, public continueFunc: () => void) {
        super(game);
    }

    public override continue() {
        this.continueFunc();
        return undefined;
    }

    public override getDebugInfo() {
        return this.continueFunc.toString();
    }
}
