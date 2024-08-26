import type { AbilityContext } from '../ability/AbilityContext';
import { EffectName, EventName } from '../Constants';
import type { Attack } from './Attack';
import type Game from '../Game';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { handler } from '../../gameSystems/GameSystemLibrary';

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
    public constructor(
        game: Game,
        private attack: Attack,
        private damageHandler: (attack: Attack) => void,
        // private costHandler?: (context: AbilityContext, prompt: any) => void
    ) {
        super(game);
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.setCurrentAttack(), 'setCurrentAttack'),
            new SimpleStep(this.game, () => this.declareAttack(), 'declareAttack'),
            new SimpleStep(this.game, () => this.dealDamage(), 'dealDamage'),
            new SimpleStep(this.game, () => this.completeAttack(), 'completeAttack'),
            new SimpleStep(this.game, () => this.cleanUpAttack(), 'cleanUpAttack'),
            // new SimpleStep(this.game, () => this.game.resolveGameState(true), 'resolveGameState')
        ]);
    }

    private setCurrentAttack() {
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        // this.game.resolveGameState(true);    // TODO THIS PR: uncomment
    }

    private declareAttack() {
        this.attack.attacker.registerAttackKeywords();

        this.game.createEventAndOpenWindow(EventName.OnAttackDeclared, { attack: this.attack });
    }

    private dealDamage() {
        this.damageHandler(this.attack);
    }

    private completeAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackCompleted, {
            attack: this.attack,
            handler: () => this.attack.attacker.unregisterAttackKeywords()
        });
    }

    private cleanUpAttack() {
        this.game.currentAttack = this.attack.previousAttack;
    }
}
