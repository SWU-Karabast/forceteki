import type Game from '../Game';
import { BaseStep } from './BaseStep';

export class SimpleStep extends BaseStep {
    private readonly name: string;

    public constructor(game: Game, public continueFunc: () => void, stepName: string) {
        super(game);

        this.name = `Step: ${stepName}`;
    }

    public override continue() {
        this.continueFunc();
        return undefined;
    }

    public override getDebugInfo() {
        return this.continueFunc.toString();
    }

    public override toString() {
        return this.name;
    }
}
