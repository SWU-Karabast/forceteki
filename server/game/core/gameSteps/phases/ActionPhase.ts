import { PhaseName } from '../../Constants';
import type Game from '../../Game';
import Player from '../../Player';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ActionWindow from '../ActionWindow';

export class ActionPhase extends Phase {
    activePlayer?: Player;

    constructor(game: Game) {
        super(game, PhaseName.Action);
        this.initialise([
            new SimpleStep(this.game, () => this.queueNextAction())
        ]);
    }

    private queueNextAction() {
        this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'action'));
        this.game.queueStep(() => this.rotateActiveQueueNextAction());
    }

    private rotateActiveQueueNextAction() {
        // breaks the action loop if both players have passed
        this.game.rotateActivePlayer();
        if (this.game.actionPhaseActivePlayer !== null) {
            this.game.queueStep(() => this.queueNextAction());
        }
    }
}
