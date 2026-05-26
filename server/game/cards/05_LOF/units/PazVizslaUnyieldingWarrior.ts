import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PazVizslaUnyieldingWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3337614029',
            internalName: 'paz-vizsla#unyielding-warrior',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +2/+0 for each damage on him',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: (target.damage * 2), hp: 0
            }))
        });
    }
}