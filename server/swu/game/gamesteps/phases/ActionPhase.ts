import { Phases } from '../../core/Constants';
import type Game from '../../core/Game';
import Player from '../../core/Player';
import { Phase } from './Phase';
import { SimpleStep } from '../SimpleStep';
import ActionWindow from '../actionwindow';

// TODO: fix this comment
/**
 * III Conflict Phase
 * 3.1 Conflict phase begins.
 *     ACTION WINDOW
 *     NOTE: After this action window, if no conflict
 *     opporunities remain, proceed to (3.4).
 * 3.2 Next player in player order declares a
 *     conflict(go to Conflict Resolution), or passes
 *     (go to 3.3).
 * 3.3 Conflict Ends/Conflict was passed. Return to
 *     the action window following step (3.1).
 * 3.4 Determine Imperial Favor.
 * 3.4.1 Glory count.
 * 3.4.2 Claim Imperial Favor.
 * 3.5 Conflict phase ends.
 */
export class ActionPhase extends Phase {
    activePlayer?: Player;

    constructor(game: Game) {
        super(game, Phases.Action);
        this.initialise([
            new SimpleStep(this.game, () => this.#queueNextAction())
        ]);
    }

    #queueNextAction() {
        this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'action'));
        this.game.queueStep(() => this.#rotateActiveQueueNextAction());
    }

    #rotateActiveQueueNextAction() {
        // breaks the action loop if both players have passed
        this.game.rotateActivePlayer();
        if (this.game.actionPhaseActivePlayer !== null) {
            this.game.queueStep(() => this.#queueNextAction());
        }
    }
}
