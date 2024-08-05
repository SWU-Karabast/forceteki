import { GamePipeline } from '../GamePipeline';
import { BaseStep } from './BaseStep';
import type { IStep } from './IStep';
import type Card = require('../card/Card');
import type Player = require('../Player');

export class BaseStepWithPipeline extends BaseStep implements IStep {
    pipeline = new GamePipeline();

    queueStep(step: IStep) {
        this.pipeline.queueStep(step);
    }

    isComplete() {
        return this.pipeline.length === 0;
    }

    onCardClicked(player: Player, card: Card): boolean {
        return this.pipeline.handleCardClicked(player, card);
    }

    onMenuCommand(player: Player, arg: string, uuid: string, method: string) {
        return this.pipeline.handleMenuCommand(player, arg, uuid, method);
    }

    cancelStep() {
        this.pipeline.cancelStep();
    }

    continue() {
        try {
            return this.pipeline.continue();
        } catch (e) {
            this.game.reportError(e);
            return true;
        }
    }
}
