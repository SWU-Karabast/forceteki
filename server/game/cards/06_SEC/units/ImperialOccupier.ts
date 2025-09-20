import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ImperialOccupier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'imperial-occupier-id',
            internalName: 'imperial-occupier',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.createSpy(),
        });
    }
}
