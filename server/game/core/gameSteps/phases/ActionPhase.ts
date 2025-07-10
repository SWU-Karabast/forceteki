import { EffectName, PhaseName } from '../../Constants';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ActionWindow } from '../ActionWindow';
import type { SnapshotManager } from '../../snapshot/SnapshotManager';

export class ActionPhase extends Phase {
    private readonly getNextActionNumber: () => number;

    // each ActionWindow will use this handler to indicate if the window was passed or not
    private readonly passStatusHandler = (passed: boolean) => this.prevPlayerPassed = passed;

    private readonly snapshotManager: SnapshotManager;

    private prevPlayerPassed = false;

    public constructor(game: Game, getNextActionNumber: () => number, snapshotManager: SnapshotManager) {
        super(game, PhaseName.Action);

        this.snapshotManager = snapshotManager;
        this.getNextActionNumber = getNextActionNumber;

        this.initialise([
            new SimpleStep(this.game, () => this.setupActionPhase(), 'setupActionPhase'),
            new SimpleStep(this.game, () => this.queueNextAction(), 'queueNextAction'),
            new SimpleStep(this.game, () => this.tearDownActionPhase(), 'tearDownActionPhase'),
            new SimpleStep(this.game, () => this.endPhase(), 'endPhase'),
        ]);
    }

    private setupActionPhase() {
        for (const player of this.game.getPlayers()) {
            player.resetForActionPhase();
        }
    }

    public queueNextAction(postUndo = false) {
        if (postUndo) {
            // TODO: this is a hack to get around the fact that the pipeline queueing isn't set up to handle being cleared in the middle of a phase.
            // will be fixed in the next PR which will address the phase logic during undo
            this.game.queueSimpleStep(() => this.rotateActiveQueueNextAction(), 'rotateActiveQueueNextAction');
        }

        this.game.queueStep(new ActionWindow(
            this.game,
            'Action Window',
            'action',
            this.prevPlayerPassed,
            this.passStatusHandler,
            postUndo ? this.game.actionNumber : this.getNextActionNumber(),
            this.snapshotManager
        ));

        if (!postUndo) {
            this.game.queueSimpleStep(() => this.rotateActiveQueueNextAction(), 'rotateActiveQueueNextAction');
        }
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
