import type Game from '../Game';
import { BaseStep } from './BaseStep';

export class SimpleStep extends BaseStep {
    constructor(game: Game, public continueFunc: () => void) {
        super(game);
    }

    override continue() {
        this.continueFunc();
        return undefined;
    }

    override getDebugInfo() {
        return this.continueFunc.toString();
    }
}
