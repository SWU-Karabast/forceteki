import { GamePipeline } from '../GamePipeline';
import { BaseStep } from './BaseStep';
import type { IStep } from './IStep';
import type Card from '../card/Card';
import type Player from '../Player';

export abstract class BaseStepWithPipeline extends BaseStep implements IStep {
    public pipeline = new GamePipeline();

    public override continue() {
        try {
            return this.pipeline.continue();
        } catch (e) {
            this.game.reportError(e);
            return true;
        }
    }

    public queueStep(step: IStep) {
        this.pipeline.queueStep(step);
    }

    public isComplete() {
        return this.pipeline.length === 0;
    }

    public override onCardClicked(player: Player, card: Card): boolean {
        return this.pipeline.handleCardClicked(player, card);
    }

    public override onMenuCommand(player: Player, arg: string, uuid: string, method: string) {
        return this.pipeline.handleMenuCommand(player, arg, uuid, method);
    }

    public cancelStep() {
        this.pipeline.cancelStep();
    }
}
