import { AlertType, PhaseName, SnapshotType } from '../../Constants';
import { EventName } from '../../Constants';
import type Game from '../../Game';
import { BaseStepWithPipeline } from '../BaseStepWithPipeline';
import { SimpleStep } from '../SimpleStep';
import type { IStep } from '../IStep';
import { TriggerHandlingMode } from '../../event/EventWindow';
import * as Helpers from '../../utils/Helpers';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';
import { SnapshotTimepoint } from '../../snapshot/SnapshotInterfaces';

export enum PhaseInitializeMode {
    Normal = 'normal',
    RollbackToStartOfPhase = 'rollbackToStartOfPhase',
    RollbackToWithinPhase = 'rollbackToWithinPhase',
}

export abstract class Phase extends BaseStepWithPipeline {
    protected readonly name: PhaseName;
    protected readonly snapshotManager: SnapshotManager;

    public constructor(
        game: Game,
        name: PhaseName,
        snapshotManager: SnapshotManager
    ) {
        super(game);

        this.name = name;
        this.snapshotManager = snapshotManager;
    }

    protected initialise(steps: IStep[], initializeMode: PhaseInitializeMode): void {
        const startStep: IStep[] = [];

        // skip the start step if we're rolling back to somewhere within the phase
        if (initializeMode === PhaseInitializeMode.Normal) {
            startStep.push(new SimpleStep(this.game, () => this.takeStartOfPhaseSnapshot(), 'takeStartOfPhaseSnapshot'));
        }

        if (initializeMode !== PhaseInitializeMode.RollbackToWithinPhase) {
            startStep.push(new SimpleStep(this.game, () => this.startPhase(), 'startPhase'));
        }

        const endStep = new SimpleStep(this.game, () => this.endPhase(), 'endPhase');

        this.pipeline.initialise([
            ...startStep,
            ...steps,
            endStep
        ]);
    }

    private takeStartOfPhaseSnapshot() {
        this.snapshotManager.moveToNextTimepoint(SnapshotTimepoint.StartOfPhase);
        this.snapshotManager.takeSnapshot({
            type: SnapshotType.Phase,
            phaseName: this.name
        });
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
