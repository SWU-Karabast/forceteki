import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class WroshyrRebel extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'wroshyr-rebel-id',
            internalName: 'wroshyr-rebel',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for every 2 resources you control',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target) => ({
                power: Math.floor(target.controller.resources.length / 2),
                hp: 0,
            }))
        });
    }
}