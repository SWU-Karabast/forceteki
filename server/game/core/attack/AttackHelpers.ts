import { InitiateAttackSystem, type IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';
import type { UnitsDefeatedThisPhaseWatcher } from '../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import type { Attack } from './Attack';

export function defenderWasDefeated(attack: Attack, watcher: UnitsDefeatedThisPhaseWatcher): boolean {
    const targets = attack.getAllTargets();
    const unitTargets = targets.filter((target) => target.isUnit());
    return unitTargets.length > 0 && unitTargets.some((target) => watcher.wasDefeatedThisPhase(target, target.inPlayId));
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
