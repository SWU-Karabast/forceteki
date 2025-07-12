import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BattleDroidLegion extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1083333786',
            internalName: 'battle-droid-legion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenDefeatedAbility({
            title: 'Create 3 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 3 })
        });
    }
}
