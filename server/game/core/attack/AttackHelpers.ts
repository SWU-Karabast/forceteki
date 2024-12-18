import AbilityHelper from '../../AbilityHelper';
import { IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';
import { UnitsDefeatedThisPhaseWatcher } from '../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { Attack } from './Attack';

export function defenderWasDefeated(attack: Attack, watcher: UnitsDefeatedThisPhaseWatcher): boolean {
    const target = attack.target;
    return target.isUnit() && watcher.wasDefeatedThisPhase(target, attack.targetInPlayId);
}

export function addInitiateAttackProperties(properties): void {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolver = {
        immediateEffect: AbilityHelper.immediateEffects.attack((context) => getProperties(properties, context))
    };
}

function getProperties(properties, context): IInitiateAttackProperties {
    if (typeof properties.initiateAttack === 'function') {
        return properties.initiateAttack(context);
    }
    return properties.initiateAttack;
}
