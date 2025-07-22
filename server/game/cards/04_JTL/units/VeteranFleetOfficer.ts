import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class VeteranFleetOfficer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9347873117',
            internalName: 'veteran-fleet-officer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create an X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}