import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PeppiBowShaakHerder extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'peppi-bow#shaak-herder-id',
            internalName: 'peppi-bow#shaak-herder',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is upgraded, she gets +1/+1',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}