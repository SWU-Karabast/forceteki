import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PalaceChefDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0408293505',
            internalName: 'palace-chef-droid',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +2/+0 while defending',
            condition: (context) => context.source.isDefending(),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}