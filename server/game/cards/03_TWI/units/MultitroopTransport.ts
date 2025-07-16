import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MultitroopTransport extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1320229479',
            internalName: 'multitroop-transport',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Create a Battle Droid token',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
