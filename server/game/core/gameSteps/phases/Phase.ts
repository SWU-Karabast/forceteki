import { AlertType, PhaseName } from '../../Constants';
import { EventName } from '../../Constants';
import type Game from '../../Game';
import { BaseStepWithPipeline } from '../BaseStepWithPipeline';
import { SimpleStep } from '../SimpleStep';
import type { IStep } from '../IStep';
import { TriggerHandlingMode } from '../../event/EventWindow';
import * as Helpers from '../../utils/Helpers';

export abstract class Phase extends BaseStepWithPipeline {
    private steps: IStep[] = [];

    public constructor(
        game: Game,
        private name: PhaseName
    ) {
        super(game);
    }

    public initialise(steps: IStep[]): void {
        this.pipeline.initialise([new SimpleStep(this.game, () => this.createPhase(), 'createPhase')]);
        const startStep = new SimpleStep(this.game, () => this.startPhase(), 'startPhase');
        const endStep = new SimpleStep(this.game, () => this.endPhase(), 'endPhase');
        this.steps = [startStep, ...steps, endStep];
    }

    protected createPhase(): void {
        this.game.createEventAndOpenWindow(EventName.OnPhaseCreated, null, { phase: this.name }, TriggerHandlingMode.CannotHaveTriggers, () => {
            for (const step of this.steps) {
                this.game.queueStep(step);
            }
        });
    }

    protected startPhase(): void {
        this.game.createEventAndOpenWindow(EventName.OnPhaseStarted, null, { phase: this.name }, TriggerHandlingMode.ResolvesTriggers, () => {
            this.game.currentPhase = this.name;
            if (this.name !== PhaseName.Setup) {
                this.game.addAlert(AlertType.Notification, 'Turn: {0} - {1} Phase', this.game.roundNumber, Helpers.upperCaseFirstLetter(this.name));
            }
            this.game.snapshotManager.clearSnapshots();
        });
    }

    protected endPhase(skipEventWindow = false): void {
        if (!skipEventWindow) {
            this.game.createEventAndOpenWindow(EventName.OnPhaseEnded, null, { phase: this.name }, TriggerHandlingMode.ResolvesTriggers, () => this.game.currentPhase = null);

            // for post-phase state cleanup. emit directly, don't need a window.
            this.game.emit(EventName.OnPhaseEndedCleanup, { phase: this.name });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public resetPhase(): void { }
}
