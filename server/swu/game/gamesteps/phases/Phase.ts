import { skip } from 'node:test';
import { EventNames, Phases } from '../../core/Constants';
import type Game from '../../core/Game';
import { BaseStepWithPipeline } from '../BaseStepWithPipeline';
import { SimpleStep } from '../SimpleStep';
import type { Step } from '../Step';

export class Phase extends BaseStepWithPipeline {
    public steps: Step[] = [];

    constructor(
        game: Game,
        private name: Phases | 'setup'
    ) {
        super(game);
    }

    initialise(steps: Step[]): void {
        this.pipeline.initialise([new SimpleStep(this.game, () => this.createPhase())]);
        const startStep = new SimpleStep(this.game, () => this.startPhase());
        const endStep = new SimpleStep(this.game, () => this.endPhase());
        this.steps = [startStep, ...steps, endStep];
    }

    createPhase(): void {
        this.game.raiseEvent(EventNames.OnPhaseCreated, { phase: this.name }, () => {
            for (const step of this.steps) {
                this.game.queueStep(step);
            }
        });
    }

    startPhase(): void {
        this.game.raiseEvent(EventNames.OnPhaseStarted, { phase: this.name }, () => {
            this.game.currentPhase = this.name;
            if (this.name !== 'setup') {
                this.game.addAlert('endofround', 'turn: {0} - {1} phase', this.game.roundNumber, this.name);
            }
        });
    }

    endPhase(skipEventWindow = false): void {
        if (!skipEventWindow) {
            this.game.raiseEvent(EventNames.OnPhaseEnded, { phase: this.name });
        }
        this.game.currentPhase = '';
    }
}
