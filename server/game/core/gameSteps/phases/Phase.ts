import { skip } from 'node:test';
import { EventName, PhaseName } from '../../Constants';
import type Game from '../../Game';
import { BaseStepWithPipeline } from '../BaseStepWithPipeline';
import { SimpleStep } from '../SimpleStep';
import type { IStep } from '../IStep';

export class Phase extends BaseStepWithPipeline {
    public steps: IStep[] = [];

    constructor(
        game: Game,
        private name: PhaseName | 'setup'
    ) {
        super(game);
    }

    initialise(steps: IStep[]): void {
        this.pipeline.initialise([new SimpleStep(this.game, () => this.createPhase())]);
        const startStep = new SimpleStep(this.game, () => this.startPhase());
        const endStep = new SimpleStep(this.game, () => this.endPhase());
        this.steps = [startStep, ...steps, endStep];
    }

    createPhase(): void {
        this.game.raiseEvent(EventName.OnPhaseCreated, { phase: this.name }, () => {
            for (const step of this.steps) {
                this.game.queueStep(step);
            }
        });
    }

    startPhase(): void {
        this.game.raiseEvent(EventName.OnPhaseStarted, { phase: this.name }, () => {
            this.game.currentPhase = this.name;
            if (this.name !== 'setup') {
                this.game.addAlert('endofround', 'turn: {0} - {1} phase', this.game.roundNumber, this.name);
            }
        });
    }

    endPhase(skipEventWindow = false): void {
        if (!skipEventWindow) {
            this.game.raiseEvent(EventName.OnPhaseEnded, { phase: this.name });
        }
        this.game.currentPhase = '';
    }
}
