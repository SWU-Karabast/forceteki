import { InitiateAttackSystem, type IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';
import type { CardsDefeatedThisPhaseWatcher } from '../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import type { Attack } from './Attack';
import type { AbilityContext } from '../ability/AbilityContext';
import type { IAttackableCard } from '../card/CardInterfaces';
import type { Card } from '../card/Card';
import type { GameEvent } from '../event/GameEvent';
import { DamageType } from '../Constants';
import { DamageSystem } from '../../gameSystems/DamageSystem';

export function defenderWasDefeated(attack: Attack, watcher: CardsDefeatedThisPhaseWatcher): boolean {
    const unitTargets = attack.getAllTargets().filter((target) => target.isUnit() || target.isDeployableLeader());
    return unitTargets.length > 0 && unitTargets.some((target) => watcher.wasDefeatedThisPhase(target, attack.targetInPlayMap.get(target)));
}

export function attackerSurvived(attack: Attack, watcher: CardsDefeatedThisPhaseWatcher): boolean {
    return !watcher.wasDefeatedThisPhase(attack.attacker, attack.attackerInPlayId);
}

/**
 * Builds the event for the attack's current attacker dealing its combat damage to `target`, including any
 * Overwhelm damage that would follow from it. Returns `null` if the attacker can't deal combat damage.
 */
export function createAttackerCombatDamageEvent(attack: Attack, target: IAttackableCard, context: AbilityContext): GameEvent | null {
    const combatDamage = attack.getAttackerCombatDamage(context);

    if (combatDamage === null) {
        return null;
    }

    const attackerDamageEvent = new DamageSystem({
        type: DamageType.Combat,
        amount: combatDamage,
        sourceAttack: attack,
        target: target
    }).generateEvent(context);

    if (attack.hasOverwhelm()) {
        attackerDamageEvent.setContingentEventsGenerator((event) => {
            const attackTarget: Card = event.card;

            if (!attackTarget.isUnit() || event.damage <= attackTarget.remainingHp) {
                return [];
            }

            const overwhelmSystem = new DamageSystem({
                type: DamageType.Overwhelm,
                contingentSourceEvent: attackerDamageEvent,
                sourceAttack: attack,
                target: event.card.controller.base
            });

            return [overwhelmSystem.generateEvent(context)];
        });
    }

    return attackerDamageEvent;
}

export function addInitiateAttackProperties(properties): void {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolver = {
        immediateEffect: new InitiateAttackSystem((context) => getProperties(properties, context))
    };
}

function getProperties(properties, context): IInitiateAttackProperties {
    if (typeof properties.initiateAttack === 'function') {
        return properties.initiateAttack(context);
    }
    return properties.initiateAttack;
}
