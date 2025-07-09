import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KijimiPatrollers extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5345999887',
            internalName: 'kijimi-patrollers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Create a TIE Fighter token',
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
