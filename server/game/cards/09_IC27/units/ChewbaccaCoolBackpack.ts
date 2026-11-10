import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChewbaccaCoolBackpack extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1399684333',
            internalName: 'chewbacca#cool-backpack',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is damaged, he gets +4/+0',
            condition: (context) => context.source.damage > 0,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
        });
    }
}