import { InitiateAttackSystem, type IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';
import type { CardsDefeatedThisPhaseWatcher } from '../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import type { Attack } from './Attack';

export function defenderWasDefeated(attack: Attack, watcher: CardsDefeatedThisPhaseWatcher): boolean {
    const unitTargets = attack.getAllTargets().filter((target) => target.isUnit() || target.isDeployableLeader());
    return unitTargets.length > 0 && unitTargets.some((target) => watcher.wasDefeatedThisPhase(target, attack.targetInPlayMap.get(target)));
}

export function attackerSurvived(attack: Attack, watcher: CardsDefeatedThisPhaseWatcher): boolean {
    return !watcher.wasDefeatedThisPhase(attack.attacker, attack.attackerInPlayId);
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
