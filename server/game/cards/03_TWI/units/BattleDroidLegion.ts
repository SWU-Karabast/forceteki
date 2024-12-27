import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BattleDroidLegion extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1083333786',
            internalName: 'battle-droid-legion',
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Create 3 Battle Droid tokens',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 3 })
        });
    }
}

BattleDroidLegion.implemented = true;