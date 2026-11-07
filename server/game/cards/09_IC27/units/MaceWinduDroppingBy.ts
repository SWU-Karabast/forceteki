import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MaceWinduDroppingBy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mace-windu#dropping-by-id',
            internalName: 'mace-windu#dropping-by',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give an Experience token to this unit',
            immediateEffect: abilityHelper.immediateEffects.giveExperience(),
        });
    }
}