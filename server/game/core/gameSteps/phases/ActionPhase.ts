import { PhaseName } from '../../Constants';
import type Game from '../../Game';
import Player from '../../Player';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ActionWindow from '../ActionWindow';

export class ActionPhase extends Phase {
    public activePlayer?: Player;

    public constructor(game: Game) {
        super(game, PhaseName.Action);
        this.initialise([
            new SimpleStep(this.game, () => this.queueNextAction(), 'queueNextAction')
        ]);
    }

    private queueNextAction() {
        this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'action'));
        this.game.queueSimpleStep(() => this.rotateActiveQueueNextAction(), 'rotateActiveQueueNextAction');
    }

    private rotateActiveQueueNextAction() {
        // breaks the action loop if both players have passed
        this.game.queueSimpleStep(() => this.game.rotateActivePlayer(), 'rotateActivePlayer');
        this.game.queueSimpleStep(() => {
            if (this.game.actionPhaseActivePlayer !== null) {
                this.game.queueSimpleStep(() => this.queueNextAction(), 'queueNextAction');
            }
        }, 'check active player queue next action');
    }
}
