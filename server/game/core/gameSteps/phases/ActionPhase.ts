import { EffectName, PhaseName } from '../../Constants';
import type Game from '../../Game';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import { ActionWindow } from '../ActionWindow';

export class ActionPhase extends Phase {
    // each ActionWindow will use this handler to indicate if the window was passed or not
    private readonly passStatusHandler = (passed: boolean) => this.prevPlayerPassed = passed;
    private prevPlayerPassed = false;

    public constructor(game: Game) {
        super(game, PhaseName.Action);
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

    public queueNextAction() {
        if (this.game.isUndoEnabled) {
            this.game.queueSimpleStep(() => this.game.gameObjectManager.takeSnapshot({ type: 'Player' }), 'actionTakeSnapshot');
        }
        this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'action', this.prevPlayerPassed, this.passStatusHandler));
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

    private tearDownActionPhase() {
        for (const player of this.game.getPlayers()) {
            player.cleanupFromActionPhase();
        }
        this.game.isInitiativeClaimed = false;
    }

    public override resetPhase(): void {
        this.pipeline.clearSteps();
    }

    public takeSnapshot() {
        return this.game.gameObjectManager.takeSnapshot({ type: 'Phase', phaseName: 'Action' });
    }

    public rollbackToSnapshot(snapshotId: number | null) {
        this.game.gameObjectManager.rollbackToSnapshot(snapshotId);
        this.resetPhase();
        this.queueNextAction();
        // continue the action phase again.
        this.continue();
    }
}
