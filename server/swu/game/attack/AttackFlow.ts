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

// UP NEXT: finish this
export class AttackFlow extends BaseStepWithPipeline {
    constructor(
        game: Game,
        private attack: Attack,
        private damageHandler: (attack: Attack) => void,
        // private costHandler?: (context: AbilityContext, prompt: any) => void
    ) {
        super(game);
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.#setCurrentAttack()),
            new SimpleStep(this.game, () => this.#dealDamage()),
            new SimpleStep(this.game, () => this.#completeAttack()),
            new SimpleStep(this.game, () => this.#cleanUpAttack()),
            // new SimpleStep(this.game, () => this.game.checkGameState(true))
        ]);
    }

    #setCurrentAttack() {
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        // this.game.checkGameState(true);
    }

    #dealDamage() {
        this.damageHandler(this.attack);
    }

    #completeAttack() {
        this.game.raiseEvent(EventNames.OnAttackCompleted, { attack: this.attack });
    }

    #cleanUpAttack() {
        this.game.currentAttack = this.attack.previousAttack;
    }
}
