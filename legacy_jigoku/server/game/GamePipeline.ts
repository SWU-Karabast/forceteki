import type Player = require('./player');
import type BaseCard = require('./basecard');
import type Ring = require('./ring');
import type { Step } from './gamesteps/Step';

type StepFactory = () => Step;
type StepItem = Step | StepFactory;

export class GamePipeline {
    public pipeline: Array<StepItem> = [];
    public queue: Array<StepItem> = [];

    initialise(steps: StepItem[]): void {
        this.pipeline = steps;
    }

    get length(): number {
        return this.pipeline.length;
    }

    getCurrentStep(): Step {
        const step = this.pipeline[0];

        if (typeof step === 'function') {
            const createdStep = step();
            this.pipeline[0] = createdStep;
            return createdStep;
        }

        return step;
    }

    queueStep(step: Step) {
        if (this.pipeline.length === 0) {
            this.pipeline.unshift(step);
        } else {
            var currentStep = this.getCurrentStep();
            if (currentStep.queueStep) {
                currentStep.queueStep(step);
            } else {
                this.queue.push(step);
            }
        }
    }

    cancelStep() {
        if (this.pipeline.length === 0) {
            return;
        }

        var step = this.getCurrentStep();

        if (step.cancelStep && step.isComplete) {
            step.cancelStep();
            if (!step.isComplete()) {
                return;
            }
        }

        this.pipeline.shift();
    }

    handleCardClicked(player: Player, card: BaseCard) {
        if (this.pipeline.length > 0) {
            var step = this.getCurrentStep();
            if (step.onCardClicked(player, card) !== false) {
                return true;
            }
        }

        return false;
    }

    handleRingClicked(player: Player, ring: Ring) {
        if (this.pipeline.length === 0) {
            return false;
        }

        const step = this.getCurrentStep();
        if (step.onRingClicked(player, ring) !== false) {
            return true;
        }
    }

    handleMenuCommand(player: Player, arg: string, uuid: string, method: string) {
        if (this.pipeline.length === 0) {
            return false;
        }

        const step = this.getCurrentStep();
        return step.onMenuCommand(player, arg, uuid, method) !== false;
    }

    continue() {
        this.#queueIntoPipeline();

        while (this.pipeline.length > 0) {
            const currentStep = this.getCurrentStep();

            // Explicitly check for a return of false - if no return values is
            // defined then just continue to the next step.
            if (currentStep.continue() === false) {
                if (this.queue.length === 0) {
                    return false;
                }
            } else {
                this.pipeline = this.pipeline.slice(1);
            }

            this.#queueIntoPipeline();
        }
        return true;
    }

    #queueIntoPipeline() {
        this.pipeline.unshift(...this.queue);
        this.queue = [];
    }

    getDebugInfo() {
        return {
            pipeline: this.pipeline.map((step) => this.getDebugInfoForStep(step)),
            queue: this.queue.map((step) => this.getDebugInfoForStep(step))
        };
    }

    getDebugInfoForStep(step: StepItem) {
        if (typeof step === 'function') {
            return step.toString();
        }

        let name = step.constructor.name;
        if (step.pipeline) {
            let result = {};
            result[name] = step.pipeline.getDebugInfo();
            return result;
        }

        if (step.getDebugInfo) {
            return step.getDebugInfo();
        }

        return name;
    }
}
