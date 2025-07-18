import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class PeltaSupplyFrigate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9966134941',
            internalName: 'pelta-supply-frigate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Create a Clone Trooper token',
            when: {
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });
    }
}
