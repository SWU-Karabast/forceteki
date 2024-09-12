import AbilityHelper from '../../AbilityHelper';
import { IInitiateAttackProperties } from '../../gameSystems/InitiateAttackSystem';

export const addInitiateAttackProperties = (properties) => {
    if (!properties.initiateAttack) {
        return;
    }

    properties.targetResolver = {
        immediateEffect: AbilityHelper.immediateEffects.attack((context) => getProperties(properties, context))
    };
};

const getProperties = (properties, context): IInitiateAttackProperties => {
    if (typeof properties.initiateAttack === 'function') {
        return properties.initiateAttack(context);
    }
    return properties.initiateAttack;
};
