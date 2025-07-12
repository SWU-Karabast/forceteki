import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CaptainRexLeadByExample extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0511508627',
            internalName: 'captain-rex#lead-by-example'
        };
    }

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create 2 Clone Trooper tokens.',
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper({ amount: 2 })
        });
    }
}
