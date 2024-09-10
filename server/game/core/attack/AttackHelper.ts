import AbilityHelper from '../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../Constants';
import { AttackSelectionMode } from '../../TargetInterfaces';
import { IInitiateUnitAttackProperties } from '../../gameSystems/InitiateUnitAttackSystem';

export const addInitiateAttackProperties = (properties) => {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolver = {
        cardTypeFilter: WildcardCardType.Unit,
        immediateEffect: AbilityHelper.immediateEffects.attack(AttackSelectionMode.SelectAttackerAndTarget,
            (context) => getProperties(properties, context))
    };
};

const getProperties = (properties, context): IInitiateUnitAttackProperties => {
    if (typeof properties.initiateAttack === 'function') {
        return properties.initiateAttack(context);
    }
    return properties.initiateAttack;
};
