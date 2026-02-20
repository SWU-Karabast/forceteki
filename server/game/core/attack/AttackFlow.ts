import type { AbilityContext } from '../ability/AbilityContext';
import { DamageType, EventName } from '../Constants';
import type { Attack } from './Attack';
import { BaseStepWithPipeline } from '../gameSteps/BaseStepWithPipeline';
import { SimpleStep } from '../gameSteps/SimpleStep';
import * as EnumHelpers from '../utils/EnumHelpers';
import { GameEvent } from '../event/GameEvent';
import type { Card } from '../card/Card';
import { TriggerHandlingMode } from '../event/EventWindow';
import { DamageSystem } from '../../gameSystems/DamageSystem';
import type { IAttackableCard } from '../card/CardInterfaces';
import * as Contract from '../utils/Contract';

export enum AttackRulesVersion {
    CR6 = 'cr6',
    CR7 = 'cr7'
}

export class AttackFlow extends BaseStepWithPipeline {
    private context: AbilityContext;
    private attack: Attack;
    private attackRulesVersion: AttackRulesVersion;

    public constructor(
        context: AbilityContext,
        attack: Attack
    ) {
        super(context.game);

        this.context = context;
        this.attack = attack;
        this.attackRulesVersion = context.game.attackRulesVersion;

        let attackResolutionSteps: SimpleStep[];

        switch (this.attackRulesVersion) {
            case AttackRulesVersion.CR6:
                attackResolutionSteps = [
                    new SimpleStep(this.game, () => this.openDealDamageWindow(), 'openDealDamageWindow'),
                    new SimpleStep(this.game, () => this.completeAttack(), 'completeAttack')
                ];
                break;
            case AttackRulesVersion.CR7:
                attackResolutionSteps = [
                    new SimpleStep(this.game, () => this.openDealDamageWindow(true), 'dealDamageAndCompleteAttack'),
                ];
                break;
            default:
                Contract.fail(`Unsupported attack rules version '${this.attackRulesVersion}'`);
        }

        this.pipeline.initialise([
            new SimpleStep(this.game, () => this.setCurrentAttack(), 'setCurrentAttack'),
            new SimpleStep(this.game, () => this.declareAttack(), 'declareAttack'),
            ...attackResolutionSteps,
            new SimpleStep(this.game, () => this.cleanUpAttack(), 'cleanUpAttack'),
            new SimpleStep(this.game, () => this.game.resolveGameState(true), 'resolveGameState')
        ]);
    }

    private setCurrentAttack() {
        this.attack.attacker.setActiveAttack(this.attack);
        this.attack.getAllTargets().forEach((target) => target.setActiveAttack(this.attack));
        this.attack.previousAttack = this.game.currentAttack;
        this.game.currentAttack = this.attack;
        this.game.resolveGameState(true);
    }

    private declareAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackDeclared, this.context, { attack: this.attack }, TriggerHandlingMode.ResolvesTriggers);
    }

    private openDealDamageWindow(includeAttackCompleteEvent = false): void {
        let attackCompleteEvent: GameEvent = null;
        if (includeAttackCompleteEvent) {
            attackCompleteEvent = new GameEvent(
                EventName.OnAttackEnd,
                this.context,
                { attack: this.attack }
            );

            // ensure that this resolves after the damage events
            attackCompleteEvent.order = 1;
        }

        this.context.game.createEventAndOpenWindow(
            EventName.OnAttackDamageResolved,
            this.context,
            { attack: this.attack },
            TriggerHandlingMode.ResolvesTriggers,
            () => this.dealDamage(attackCompleteEvent)
        );
    }

    private dealDamage(additionalEvent?: GameEvent): void {
        if (!this.attack.isAttackerLegal()) {
            this.context.game.addMessage('The attack does not resolve because the attacker is no longer valid');
            return;
        }

        const legalTargets = this.attack.getLegalTargets();

        if (legalTargets.length === 0) {
            this.context.game.addMessage('The attack does not resolve because there is no longer a legal target');
            return;
        }

        const inPlayTargets = [];
        let directOverwhelmDamage = 0;

        // Handle any targets that left play
        for (const target of legalTargets) {
            if (this.attack.isTargetStillInPlay(target)) {
                // Do nothing - normal attacks
                inPlayTargets.push(target);
            } else if (this.attack.hasOverwhelm()) {
                // This target is no longer in play
                directOverwhelmDamage += this.attack.getAttackerCombatDamage(this.context);
            }
        }

        const damageEvents: GameEvent[] = [];

        // TSTODO: This will need to be updated to account for attacking units owned by different opponents
        const targetControllerBase = this.attack.getDefendingPlayer().base;

        if (directOverwhelmDamage > 0) {
            damageEvents.push(new DamageSystem({
                type: DamageType.Overwhelm,
                amount: directOverwhelmDamage,
                sourceAttack: this.attack,
                target: targetControllerBase
            }).generateEvent(this.context));
        }

        if (inPlayTargets.length > 0) {
            const attackerDealsDamageFirst = this.attack.attackerDealsCombatDamageFirst();
            const anyDefenderDealsDamageFirst = this.attack.anyTargetDealsCombatDamageFirst();

            Contract.assertFalse(attackerDealsDamageFirst && anyDefenderDealsDamageFirst, 'Attack cannot have both attacker and defender(s) dealing damage first');

            if (attackerDealsDamageFirst) {
                // Attacker deals damage first
                const attackerDamageEvents = inPlayTargets
                    .map((target) => this.createAttackerDamageEvent(target))
                    .filter((event) => event !== null);
                damageEvents.push(...attackerDamageEvents);

                this.context.game.openEventWindow(damageEvents);
                this.context.game.queueSimpleStep(() => {
                    const events = additionalEvent ? [additionalEvent] : [];

                    if (inPlayTargets.some((target) => !target.isBase() && target.isInPlay())) {
                        const defenderDamageEvent = this.createDefenderDamageEvent(false);
                        if (defenderDamageEvent !== null) {
                            events.push(defenderDamageEvent);
                        }
                    }

                    if (events.length > 0) {
                        this.context.game.openEventWindow(events);
                    }
                }, 'defender damage after attacker');
            } else if (anyDefenderDealsDamageFirst) {
                // Some/all defenders deal damage first
                const earlyDefenderDamageEvent = this.createDefenderDamageEvent(true);
                if (earlyDefenderDamageEvent !== null) {
                    damageEvents.push(earlyDefenderDamageEvent);
                }

                this.context.game.openEventWindow(damageEvents);
                this.context.game.queueSimpleStep(() => {
                    const normalDamageEvents = additionalEvent ? [additionalEvent] : [];

                    // Attacker damages all targets if still alive
                    if (this.attack.isAttackerLegal()) {
                        const attackerDamageEvents = inPlayTargets
                            .filter((target) => target.isBase() || target.isInPlay())
                            .map((target) => this.createAttackerDamageEvent(target))
                            .filter((event) => event !== null);
                        normalDamageEvents.push(...attackerDamageEvents);
                    }

                    // Normal defenders deal damage if any are still alive
                    if (inPlayTargets.some((target) => !target.isBase() && target.isInPlay() && !this.attack.targetDealsCombatDamageFirst(target))) {
                        const normalDefenderDamageEvent = this.createDefenderDamageEvent();
                        if (normalDefenderDamageEvent !== null) {
                            normalDamageEvents.push(normalDefenderDamageEvent);
                        }
                    }

                    if (normalDamageEvents.length > 0) {
                        this.context.game.openEventWindow(normalDamageEvents);
                    }
                }, 'attacker and normal defender damage');
            } else {
                // Normal attack - all damage simultaneous
                const attackerDamageEvents = inPlayTargets
                    .map((target) => this.createAttackerDamageEvent(target))
                    .filter((event) => event !== null);
                damageEvents.push(...attackerDamageEvents);

                if (additionalEvent) {
                    damageEvents.push(additionalEvent);
                }

                if (inPlayTargets.some((target) => !target.isBase())) {
                    const defenderDamageEvent = this.createDefenderDamageEvent();
                    if (defenderDamageEvent !== null) {
                        damageEvents.push(defenderDamageEvent);
                    }
                }
                this.context.game.openEventWindow(damageEvents);
            }
        } else if (directOverwhelmDamage > 0) {
            if (additionalEvent) {
                damageEvents.push(additionalEvent);
            }

            this.context.game.openEventWindow(damageEvents);
        }
    }

    private createAttackerDamageEvent(target: IAttackableCard): GameEvent | null {
        const combatDamage = this.attack.getAttackerCombatDamage(this.context);

        if (combatDamage === null) {
            return null;
        }

        const attackerDamageEvent = new DamageSystem({
            type: DamageType.Combat,
            amount: combatDamage,
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

    /**
     * Create a damage event for defenders dealing damage to the attacker.
     * @param earlyCombatDamageOnly - `true`: only include damage for defenders that deal damage first, `false`: only include damage for defenders that don't deal damage first
     */
    private createDefenderDamageEvent(earlyCombatDamageOnly: boolean = false): GameEvent | null {
        const combatDamage = this.attack.getTargetCombatDamage(this.context, earlyCombatDamageOnly);

        if (combatDamage === null || combatDamage === 0) {
            return null;
        }

        return new DamageSystem({
            type: DamageType.Combat,
            amount: combatDamage,
            sourceAttack: this.attack,
            target: this.attack.attacker
        }).generateEvent(this.context);
    }

    private completeAttack() {
        this.game.createEventAndOpenWindow(EventName.OnAttackEnd, this.context, {
            attack: this.attack,
        }, TriggerHandlingMode.ResolvesTriggers);
    }

    private cleanUpAttack() {
        if (this.attackRulesVersion === AttackRulesVersion.CR7) {
            this.game.ongoingEffectEngine.unregisterOnAttackEffects();
        }

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
