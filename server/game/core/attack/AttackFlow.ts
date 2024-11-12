import type { AbilityContext } from '../ability/AbilityContext';
import { DamageType, EventName } from '../Constants';
import type { Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import { CardWithDamageProperty } from '../card/CardTypes';
import * as EnumHelpers from '../utils/EnumHelpers';
import AbilityHelper from '../../AbilityHelper';
import { GameEvent } from '../event/GameEvent';
import { Card } from '../card/Card';
import { TriggerHandlingMode } from '../event/EventWindow';
import { DamageSystem } from '../../gameSystems/DamageSystem';

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
        this.attack.attacker.setActiveAttack(this.attack);
        this.attack.target.setActiveAttack(this.attack);

        this.game.createEventAndOpenWindow(EventName.OnAttackDeclared, this.context, { attack: this.attack }, TriggerHandlingMode.ResolvesTriggers);
    }

    private openDealDamageWindow(): void {
        this.context.game.createEventAndOpenWindow(
            EventName.OnAttackDamageResolved,
            this.context,
            { attack: this.attack },
            TriggerHandlingMode.ResolvesTriggers,
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
            new DamageSystem({
                type: DamageType.Overwhelm,
                amount: this.attack.getAttackerTotalPower(),
                sourceAttack: this.attack
            }).resolve(this.attack.target.controller.base, this.context);
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
            type: DamageType.Combat,
            amount: this.attack.getAttackerTotalPower(),
            sourceAttack: this.attack,
            target: this.attack.target
        }).generateEvent(this.context);

        if (this.attack.hasOverwhelm()) {
            attackerDamageEvent.setContingentEventsGenerator((event) => {
                const attackTarget: Card = event.card;

                if (!attackTarget.isUnit() || event.damage <= attackTarget.remainingHp) {
                    return [];
                }

                const overwhelmSystem = new DamageSystem({
                    type: DamageType.Overwhelm,
                    contingentSourceEvent: attackerDamageEvent,
                    sourceAttack: this.attack,
                    target: event.card.controller.base
                });

                return [overwhelmSystem.generateEvent(this.context)];
            });
        }

        return attackerDamageEvent;
    }

    private createDefenderDamageEvent(): GameEvent {
        return AbilityHelper.immediateEffects.damage({
            type: DamageType.Combat,
            amount: this.attack.getTargetTotalPower(),
            sourceAttack: this.attack,
            target: this.attack.attacker
        }).generateEvent(this.context);
    }

    private completeAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackCompleted, this.context, {
            attack: this.attack,
        }, TriggerHandlingMode.ResolvesTriggers);
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
