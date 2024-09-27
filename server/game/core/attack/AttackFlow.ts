import type { AbilityContext } from '../ability/AbilityContext';
import { EffectName, EventName } from '../Constants';
import type { Attack } from './Attack';
import type Game from '../Game';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { handler } from '../../gameSystems/GameSystemLibrary';
import { CardWithDamageProperty } from '../card/CardTypes';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Contract from '../utils/Contract';
import AbilityHelper from '../../AbilityHelper';
import { GameEvent } from '../event/GameEvent';
import { Card } from '../card/Card';

export class AttackFlow extends BaseStepWithPipeline {
    public constructor(
        private context: AbilityContext,
        private attack: Attack,
    ) {
        super(context.game);
        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.setCurrentAttack(), 'setCurrentAttack'),
            new SimpleStep(this.game, () => this.declareAttack(), 'declareAttack'),
            new SimpleStep(this.game, () => this.dealDamage(), 'dealDamage'),
            new SimpleStep(this.game, () => this.completeAttack(), 'completeAttack'),
            new SimpleStep(this.game, () => this.cleanUpAttack(), 'cleanUpAttack'),
            new SimpleStep(this.game, () => this.game.resolveGameState(true), 'resolveGameState')
        ]);
    }

    private setCurrentAttack() {
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        this.game.resolveGameState(true);
    }

    private declareAttack() {
        this.attack.attacker.registerAttackKeywords();
        this.attack.attacker.setActiveAttack(this.attack);
        this.attack.target.setActiveAttack(this.attack);

        this.game.createEventAndOpenWindow(EventName.OnAttackDeclared, { attack: this.attack }, true);
    }

    private dealDamage(): void {
        if (!this.attack.isAttackerInPlay()) {
            this.context.game.addMessage('The attack does not resolve because the attacker is no longer in play');
            return;
        }

        let overwhelmDamageOnly = false;
        if (!this.attack.isDefenderInPlay()) {
            if (!this.attack.hasOverwhelm()) {
                this.context.game.addMessage('The attack does not resolve because the defender is no longer in play');
                return;
            }

            // if the defender is no longer in play but the attack has overwhelm, all damage is considered overwhelm damage and dealt to the base (SWU 5.7.G)
            overwhelmDamageOnly = true;
        }

        let damageEvents: GameEvent[];

        if (overwhelmDamageOnly) {
            damageEvents = [AbilityHelper.immediateEffects.damage({ amount: this.attack.getAttackerTotalPower() }).generateEvent(this.attack.target.controller.base, this.context)];
        } else {
            damageEvents = this.createDamageEvents();
        }

        this.context.game.openEventWindow(damageEvents, true);
    }

    private createDamageEvents(): GameEvent[] {
        const damageEvents = [];

        // event for damage dealt to target by attacker
        const attackerDamageEvent: any = AbilityHelper.immediateEffects.damage({
            amount: this.attack.getAttackerTotalPower(),
            isCombatDamage: true,
        }).generateEvent(this.attack.target, this.context);

        if (this.attack.hasOverwhelm()) {
            attackerDamageEvent.createContingentEvents = (event) => {
                const attackTarget: Card = event.card;

                if (!attackTarget.isUnit() || event.damage <= attackTarget.remainingHp) {
                    return [];
                }

                const overwhelmEvent = AbilityHelper.immediateEffects.damage({
                    amount: event.damage - event.card.remainingHp,
                }).generateEvent(event.card.controller.base, this.context);

                return [overwhelmEvent];
            };
        }

        damageEvents.push(attackerDamageEvent);

        // event for damage dealt to attacker by defender, if any
        if (!this.attack.target.isBase()) {
            damageEvents.push(AbilityHelper.immediateEffects.damage({ amount: this.attack.getTargetTotalPower(), isCombatDamage: true }).generateEvent(this.attack.attacker, this.context));
        }

        return damageEvents;
    }

    private completeAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackCompleted, {
            attack: this.attack,
            handler: () => {
                // only unregister if the attacker hasn't been moved out of the play area (e.g. defeated)
                if (EnumHelpers.isArena(this.attack.attacker.location)) {
                    this.attack.attacker.unregisterAttackKeywords();
                }
            }
        }, true);
    }

    private cleanUpAttack() {
        this.game.currentAttack = this.attack.previousAttack;
        this.checkUnsetActiveAttack(this.attack.attacker);
        this.checkUnsetActiveAttack(this.attack.target);
    }

    private checkUnsetActiveAttack(card: CardWithDamageProperty) {
        if (EnumHelpers.isArena(card.location) || card.isBase()) {
            card.unsetActiveAttack();
        }
    }
}
