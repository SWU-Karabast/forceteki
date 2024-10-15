import type { AbilityContext } from '../ability/AbilityContext';
import { EventName } from '../Constants';
import type { Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { CardWithDamageProperty } from '../card/CardTypes';
import * as EnumHelpers from '../utils/EnumHelpers';
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
            new SimpleStep(this.game, () => this.openDealDamageWindow(), 'openDealDamageWindow'),
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

    private openDealDamageWindow(): void {
        this.context.game.createEventAndOpenWindow(
            EventName.OnAttackDamageResolved,
            { attack: this.attack },
            true,
            () => this.dealDamage()
        );
    }

    private dealDamage(): void {
        if (!this.attack.isAttackerInPlay()) {
            this.context.game.addMessage('The attack does not resolve because the attacker is no longer in play');
            return;
        }

        let overwhelmDamageOnly = false;
        if (!this.attack.isAttackTargetLegal()) {
            if (!this.attack.hasOverwhelm()) {
                this.context.game.addMessage('The attack does not resolve because the defender is no longer in play');
                return;
            }

            // if the defender is no longer in play but the attack has overwhelm, all damage is considered overwhelm damage and dealt to the base (SWU 5.7.G)
            overwhelmDamageOnly = true;
        }

        const attackerDealsDamageBeforeDefender = this.attack.attackerDealsDamageBeforeDefender();
        if (overwhelmDamageOnly) {
            AbilityHelper.immediateEffects.damage({ amount: this.attack.getAttackerTotalPower() }).resolve(this.attack.target.controller.base, this.context);
        } else if (attackerDealsDamageBeforeDefender) {
            this.context.game.openEventWindow(this.createAttackerDamageEvent());
            this.context.game.queueSimpleStep(() => {
                if (!this.attack.target.isBase() && this.attack.target.isInPlay()) {
                    this.context.game.openEventWindow(this.createDefenderDamageEvent());
                }
            }, 'check and queue event for defender damage');
        } else {
            // normal attack
            const damageEvents = [this.createAttackerDamageEvent()];
            if (!this.attack.target.isBase()) {
                damageEvents.push(this.createDefenderDamageEvent());
            }
            this.context.game.openEventWindow(damageEvents);
        }
    }

    private createAttackerDamageEvent(): GameEvent {
        // event for damage dealt to target by attacker
        const attackerDamageEvent = AbilityHelper.immediateEffects.damage({
            amount: this.attack.getAttackerTotalPower(),
            isCombatDamage: true,
            sourceAttack: this.attack,
        }).generateEvent(this.attack.target, this.context);

        if (this.attack.hasOverwhelm()) {
            attackerDamageEvent.setContingentEventsGenerator((event) => {
                const attackTarget: Card = event.card;

                if (!attackTarget.isUnit() || event.damage <= attackTarget.remainingHp) {
                    return [];
                }

                const overwhelmEvent = AbilityHelper.immediateEffects.damage({
                    amount: event.damage - event.card.remainingHp,
                }).generateEvent(event.card.controller.base, this.context);

                return [overwhelmEvent];
            });
        }

        return attackerDamageEvent;
    }

    private createDefenderDamageEvent(): GameEvent {
        return AbilityHelper.immediateEffects.damage({
            amount: this.attack.getTargetTotalPower(),
            isCombatDamage: true,
            sourceAttack: this.attack
        }).generateEvent(this.attack.attacker, this.context);
    }

    private completeAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackCompleted, {
            attack: this.attack,
            handler: () => {
                // only unregister if the attacker hasn't been moved out of the play area (e.g. defeated)
                if (this.attack.isAttackerInPlay()) {
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
