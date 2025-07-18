import { EffectName, PhaseName } from '../../Constants';
import type Game from '../../Game';
import { Phase, PhaseInitializeMode } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ActionWindow } from '../ActionWindow';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';
import type { IStep } from '../IStep';

export class ActionPhase extends Phase {
    private readonly getNextActionNumber: () => number;

    // each ActionWindow will use this handler to indicate if the window was passed or not
    private readonly passStatusHandler = (passed: boolean) => this.prevPlayerPassed = passed;

    private readonly snapshotManager: SnapshotManager;

    private prevPlayerPassed = false;

    public constructor(
        game: Game,
        getNextActionNumber: () => number,
        snapshotManager: SnapshotManager,
        initializeMode: PhaseInitializeMode = PhaseInitializeMode.Normal
    ) {
        super(game, PhaseName.Action);

        this.snapshotManager = snapshotManager;
        this.getNextActionNumber = getNextActionNumber;

        const setupStep: IStep[] = [];
        if (initializeMode !== PhaseInitializeMode.RollbackToWithinPhase) {
            setupStep.push(new SimpleStep(this.game, () => this.setupActionPhase(), 'setupActionPhase'));
        }

        this.initialise(
            [
                ...setupStep,
                new SimpleStep(this.game, () => this.queueNextAction(initializeMode === PhaseInitializeMode.RollbackToWithinPhase), 'queueNextAction'),
                new SimpleStep(this.game, () => this.tearDownActionPhase(), 'tearDownActionPhase'),
                new SimpleStep(this.game, () => this.endPhase(), 'endPhase'),
            ],
            initializeMode
        );
    }

    private setupActionPhase() {
        for (const player of this.game.getPlayers()) {
            player.resetForActionPhase();
        }
    }

    private queueNextAction(firstActionAfterRollback = false) {
        this.game.queueStep(new ActionWindow(
            this.game,
            'Action Window',
            'action',
            this.prevPlayerPassed,
            this.passStatusHandler,
            firstActionAfterRollback ? this.game.actionNumber : this.getNextActionNumber(),
            this.snapshotManager
        ));

        this.game.queueSimpleStep(() => this.rotateActiveQueueNextAction(), 'rotateActiveQueueNextAction');
    }

    private rotateActiveQueueNextAction() {
        // breaks the action loop if both players have passed
        this.game.queueSimpleStep(() => {
            const activePlayer = this.game.getActivePlayer();
            if (activePlayer && activePlayer.hasOngoingEffect(EffectName.AdditionalAction)) {
                activePlayer.removeOngoingEffects(EffectName.AdditionalAction);
            } else {
                this.game.rotateActivePlayer();
            }
        }, 'rotateActivePlayer');

        this.game.queueSimpleStep(() => {
            if (this.game.actionPhaseActivePlayer !== null) {
                this.game.queueSimpleStep(() => this.queueNextAction(), 'queueNextAction');
            }
        }, 'check active player queue next action');
    }

    // --------------------- TODO: these methods are a pretty hacky way of resetting the action, need to investigate to see if there's a better way ---------------
    private tearDownActionPhase() {
        for (const player of this.game.getPlayers()) {
            player.cleanupFromActionPhase();
        }
        this.game.isInitiativeClaimed = false;
    }

    public override resetPhase(): void {
        this.pipeline.clearSteps();
    }

    public postRollbackOperations() {
        this.resetPhase();
        this.queueNextAction(true);

        // continue the action phase again.
        this.continue();
    }
}
