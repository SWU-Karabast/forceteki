import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CintaKazTheStruggleComesFirst extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7482343383',
            internalName: 'cinta-kaz#the-struggle-comes-first',
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