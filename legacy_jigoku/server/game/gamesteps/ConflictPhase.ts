import { Phases, EffectNames } from '../Constants';
import { initiateConflict } from '../GameActions/GameActions';
import AbilityDsl from '../abilitydsl';
import { Conflict } from '../conflict';
import type Game from '../game';
import type Player from '../player';
import { Phase } from './Phase';
import { SimpleStep } from './SimpleStep';
import ActionWindow from './actionwindow';

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
export class ConflictPhase extends Phase {
    currentPlayer?: Player;

    constructor(game: Game) {
        super(game, Phases.Conflict);
        this.initialise([
            new SimpleStep(this.game, () => this.beginPhase()),
            new SimpleStep(this.game, () => this.queueSteps())
        ]);
    }

    beginPhase() {
        this.currentPlayer = this.game.getFirstPlayer();
    }

    queueSteps() {
        this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'preConflict'));
        this.game.queueStep(new SimpleStep(this.game, () => this.startConflictChoice()));
    }

    startConflictChoice() {
        if (this.currentPlayer.getConflictOpportunities() === 0 && this.currentPlayer.opponent) {
            this.currentPlayer = this.currentPlayer.opponent;
        }
        if (this.currentPlayer.getConflictOpportunities() > 0) {
            const forced = this.currentPlayer.mostRecentEffect(EffectNames.ForceConflictDeclarationType);
            const props = { forcedDeclaredType: forced };
            if (
                initiateConflict(props).canAffect(this.currentPlayer, this.game.getFrameworkContext(this.currentPlayer))
            ) {
                initiateConflict(props).resolve(this.currentPlayer, this.game.getFrameworkContext(this.currentPlayer));
            } else {
                var conflict = new Conflict(this.game, this.currentPlayer, this.currentPlayer.opponent);
                conflict.passConflict(
                    '{0} passes their conflict opportunity as none of their characters can be declared as an attacker'
                );
            }
            if (this.currentPlayer.opponent) {
                this.currentPlayer = this.currentPlayer.opponent;
            }
            this.game.queueStep(new ActionWindow(this.game, 'Action Window', 'preConflict'));
            this.game.queueStep(new SimpleStep(this.game, () => this.startConflictChoice()));
        } else {
            this.game.queueStep(new SimpleStep(this.game, () => this.claimImperialFavor()));
        }
    }

    claimImperialFavor() {
        AbilityDsl.actions
            .performGloryCount({
                gameAction: (winner) => winner && AbilityDsl.actions.claimImperialFavor({ target: winner })
            })
            .resolve(null, this.game.getFrameworkContext());
    }
}
