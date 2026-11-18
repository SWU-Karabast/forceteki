import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class WatTamborWarpedWarbling extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7874824511',
            internalName: 'wat-tambor#warped-warbling',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {}
        });
    }
}