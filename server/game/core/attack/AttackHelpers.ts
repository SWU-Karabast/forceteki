import { InitiateAttackSystem, type IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';
import type { UnitsDefeatedThisPhaseWatcher } from '../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import type { Attack } from './Attack';

export function defenderWasDefeated(attack: Attack, watcher: UnitsDefeatedThisPhaseWatcher): boolean {
    const target = attack.target;
    return target.isUnit() && watcher.wasDefeatedThisPhase(target, attack.targetInPlayId);
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
