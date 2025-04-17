import type { AbilityContext } from '../ability/AbilityContext';
import { DamageType, EventName } from '../Constants';
import type { Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import * as EnumHelpers from '../utils/EnumHelpers';
import type { GameEvent } from '../event/GameEvent';
import type { Card } from '../card/Card';
import { TriggerHandlingMode } from '../event/EventWindow';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import type { IAttackableCard } from '../card/CardInterfaces';

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
        this.attack.getAllTargets().forEach((target) => target.setActiveAttack(this.attack));

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

        const inPlayTargets = [];
        let directOverwhelmDamage = 0;

        // Handle any targets that left play
        for (const target of this.attack.getAllTargets()) {
            if (target.isBase() || target.isInPlay()) {
                // Do nothing - normal attacks
                inPlayTargets.push(target);
            } else if (this.attack.hasOverwhelm()) {
                // This target is no longer in play
                directOverwhelmDamage += this.attack.getAttackerTotalPower();
            }
        }

        const damageEvents = [];

        // TSTODO: This will need to be updated to account for attacking units owned by different opponents
        const targetControllerBase = this.attack.getAllTargets()[0].controller.base;

        if (directOverwhelmDamage > 0) {
            damageEvents.push(new DamageSystem({
                type: DamageType.Overwhelm,
                amount: directOverwhelmDamage,
                sourceAttack: this.attack,
                target: targetControllerBase
            }).generateEvent(this.context));
        }

        if (inPlayTargets.length > 0) {
            const attackerDealsDamageBeforeDefender = this.attack.attackerDealsDamageBeforeDefender();

            const attackerDamageEvents = inPlayTargets.map((target) => this.createAttackerDamageEvent(target));
            damageEvents.push(...attackerDamageEvents);

            if (attackerDealsDamageBeforeDefender) {
                this.context.game.openEventWindow(damageEvents);
                this.context.game.queueSimpleStep(() => {
                    if (this.attack.getAllTargets().some((target) => !target.isBase() && target.isInPlay())) {
                        this.context.game.openEventWindow(this.createDefenderDamageEvent());
                    }
                }, 'check and queue event for defender damage');
            } else {
                // normal attack
                if (inPlayTargets.some((target) => !target.isBase())) {
                    damageEvents.push(this.createDefenderDamageEvent());
                }
                this.context.game.openEventWindow(damageEvents);
            }
        } else if (directOverwhelmDamage > 0) {
            this.context.game.openEventWindow(damageEvents);
        }
    }

    private createAttackerDamageEvent(target: IAttackableCard): GameEvent {
        const attackerDamageEvent = new DamageSystem({
            type: DamageType.Combat,
            amount: this.attack.getAttackerTotalPower(),
            sourceAttack: this.attack,
            target: target
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
        return new DamageSystem({
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
        this.attack.getAllTargets().forEach((target) => this.checkUnsetActiveAttack(target));
    }

    private checkUnsetActiveAttack(card: IAttackableCard) {
        // isUnit() check needed for pilots that may have become attached during the attack
        if ((EnumHelpers.isArena(card.zoneName) && card.isUnit()) || card.isBase()) {
            card.unsetActiveAttack();
        }
    }
}
