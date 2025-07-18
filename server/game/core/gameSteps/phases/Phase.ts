import { AlertType, PhaseName } from '../../Constants';
import { EventName } from '../../Constants';
import type Game from '../../Game';
import { BaseStepWithPipeline } from '../BaseStepWithPipeline';
import { SimpleStep } from '../SimpleStep';
import type { IStep } from '../IStep';
import { TriggerHandlingMode } from '../../event/EventWindow';
import * as Helpers from '../../utils/Helpers';

export abstract class Phase extends BaseStepWithPipeline {
    protected readonly name: PhaseName;

    private steps: IStep[] = [];

    public constructor(
        game: Game,
        name: PhaseName
    ) {
        super(game);

        this.name = name;
    }

    public initialise(steps: IStep[]): void {
        const startStep = new SimpleStep(this.game, () => this.startPhase(), 'startPhase');
        const endStep = new SimpleStep(this.game, () => this.endPhase(), 'endPhase');
        this.steps = [startStep, ...steps, endStep];

        this.pipeline.initialise(this.steps);
    }

    protected startPhase(): void {
        this.game.createEventAndOpenWindow(EventName.OnPhaseStarted, null, { phase: this.name }, TriggerHandlingMode.ResolvesTriggers, () => {
            this.game.currentPhase = this.name;
            if (this.name !== PhaseName.Setup) {
                this.game.addAlert(AlertType.Notification, 'Turn: {0} - {1} Phase', this.game.roundNumber, Helpers.upperCaseFirstLetter(this.name));
            }
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
