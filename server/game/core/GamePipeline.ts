import type Player from './Player';
import type Card from './card/Card';
import type { IStep } from './gameSteps/IStep';

type StepFactory = () => IStep;
type StepItem = IStep | StepFactory;

export class GamePipeline {
    private pipeline: StepItem[] = [];
    private stepsQueuedDuringCurrentStep: StepItem[] = [];

    public get length(): number {
        return this.pipeline.length;
    }

    public initialise(steps: StepItem[]): void {
        this.pipeline = steps;
    }

    public getCurrentStep(): IStep {
        const step = this.pipeline[0];

        if (typeof step === 'function') {
            const createdStep = step();
            this.pipeline[0] = createdStep;
            return createdStep;
        }

        return step;
    }

    public queueStep(step: IStep) {
        if (this.pipeline.length === 0) {
            this.pipeline.unshift(step);
        } else {
            const currentStep = this.getCurrentStep();
            if (currentStep.queueStep) {
                currentStep.queueStep(step);
            } else {
                this.stepsQueuedDuringCurrentStep.push(step);
            }
        }
    }

    public cancelStep() {
        if (this.pipeline.length === 0) {
            return;
        }

        const step = this.getCurrentStep();

        if (step.cancelStep && step.isComplete) {
            step.cancelStep();
            if (!step.isComplete()) {
                return;
            }
        }

        this.pipeline.shift();
    }

    public handleCardClicked(player: Player, card: Card) {
        if (this.pipeline.length > 0) {
            const step = this.getCurrentStep();
            if (step.onCardClicked(player, card) !== false) {
                return true;
            }
        }

        return false;
    }

    public handleMenuCommand(player: Player, arg: string, uuid: string, method: string) {
        if (this.pipeline.length === 0) {
            return false;
        }

        const step = this.getCurrentStep();
        return step.onMenuCommand(player, arg, uuid, method) !== false;
    }

    // UP NEXT: docstr for pipeline methods
    public continue() {
        this.queueNewStepsIntoPipeline();

        while (this.pipeline.length > 0) {
            const currentStep = this.getCurrentStep();

            // Explicitly check for a return of false - if no return values is
            // defined then just continue to the next step.
            if (currentStep.continue() === false) {
                if (this.stepsQueuedDuringCurrentStep.length === 0) {
                    return false;
                }
            } else {
                this.pipeline = this.pipeline.slice(1);
            }

            this.queueNewStepsIntoPipeline();
        }
        return true;
    }

    private queueNewStepsIntoPipeline() {
        this.pipeline.unshift(...this.stepsQueuedDuringCurrentStep);
        this.stepsQueuedDuringCurrentStep = [];
    }

    public getDebugInfo() {
        return {
            pipeline: this.pipeline.map((step) => this.getDebugInfoForStep(step)),
            queue: this.stepsQueuedDuringCurrentStep.map((step) => this.getDebugInfoForStep(step))
        };
    }

    public getDebugInfoForStep(step: StepItem) {
        if (typeof step === 'function') {
            return step.toString();
        }

        const name = step.constructor.name;
        if (step.pipeline) {
            const result = {};
            result[name] = step.pipeline.getDebugInfo();
            return result;
        }

        if (step.getDebugInfo) {
            return step.getDebugInfo();
        }

        return name;
    }
}
