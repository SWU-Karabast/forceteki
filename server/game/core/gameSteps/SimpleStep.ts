import type Game from '../Game';
import * as Contract from '../utils/Contract';
import { BaseStep } from './BaseStep';

export class SimpleStep extends BaseStep {
    private readonly name: string;

    public constructor(game: Game, public continueFunc: () => void, stepName: string) {
        Contract.assertStringValue(stepName);
        super(game);

        this.name = `'Step: ${stepName}'`;
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
