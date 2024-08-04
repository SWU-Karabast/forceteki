import type Game = require('../core/game');
import { BaseStep } from './BaseStep';

export class SimpleStep extends BaseStep {
    constructor(game: Game, public continueFunc: () => void) {
        super(game);
    }

    continue() {
        this.continueFunc();
        return undefined;
    }

    getDebugInfo() {
        return this.continueFunc.toString();
    }
}
