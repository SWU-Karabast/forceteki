import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChildOfDathomir extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5972134565',
            internalName: 'child-of-dathomir',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control 3 or more units, this unit gets +2/+0',
            condition: (context) => context.player.getArenaUnits().length >= 3,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}