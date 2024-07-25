import type { AbilityContext } from '../AbilityContext';
import { EffectNames, EventNames } from '../Constants';
import type { Attack } from './Attack';
import type Game from '../game';
import { BaseStepWithPipeline } from '../gamesteps/BaseStepWithPipeline';
import { SimpleStep } from '../gamesteps/SimpleStep';

/**
D. Duel Timing
D.1 Duel begins.
D.2 Establish challenger and challengee.
D.3 Duel honor bid.
D.4 Reveal honor dials.
D.5 Transfer honor.
D.6 Modify dueling skill.
D.7 Compare skill value and determine results.
D.8 Apply duel results.
D.9 Duel ends.
 */
export class AttackFlow extends BaseStepWithPipeline {
    constructor(
        game: Game,
        private attack: Attack,
        private resolutionHandler: (duel: Attack) => void,
        private costHandler?: (context: AbilityContext, prompt: any) => void
    ) {
        super(game);
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.#setCurrentAttack()),
            new SimpleStep(this.game, () => this.#determineResults()),
            new SimpleStep(this.game, () => this.#announceResult()),
            new SimpleStep(this.game, () => this.#strike()),
            new SimpleStep(this.game, () => this.#applyDuelResults()),
            new SimpleStep(this.game, () => this.#cleanUpDuel()),
            // new SimpleStep(this.game, () => this.game.checkGameState(true))
        ]);
    }

    #setCurrentAttack() {
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        // this.game.checkGameState(true);
    }

    #determineResults() {
        this.attack.determineResult();
    }

    #announceResult() {
        if (this.attack.challenger.mostRecentEffect(EffectNames.WinDuel) === this.attack) {
            this.game.addMessage('{0} wins the duel vs {1}', this.attack.challenger, this.attack.targets);
        } else {
            this.game.addMessage(this.attack.getTotalsForDisplay());
        }
        if (!this.attack.winner) {
            this.game.addMessage('The duel ends in a draw');
        }
        this.game.raiseEvent(EventNames.AfterDuel, {
            duel: this.attack,
            winner: this.attack.winner,
            loser: this.attack.loser,
            winningPlayer: this.attack.winningPlayer,
            losingPlayer: this.attack.losingPlayer
        });
    }

    #applyDuelResults() {
        this.game.raiseEvent(EventNames.OnDuelResolution, { duel: this.attack }, () => this.resolutionHandler(this.attack));
    }

    #cleanUpDuel() {
        this.game.currentAttack = this.attack.previousAttack;
        this.game.raiseEvent(EventNames.OnDuelFinished, { duel: this.attack });
        this.attack.cleanup();
    }
}
