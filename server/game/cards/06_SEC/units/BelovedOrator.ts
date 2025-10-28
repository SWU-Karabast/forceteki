import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BelovedOrator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9315383504',
            internalName: 'beloved-orator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Spy token',
            immediateEffect: abilityHelper.immediateEffects.createSpy()
        });
    }
}
