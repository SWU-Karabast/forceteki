import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ZygerrianStarhopper extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7389195577',
            internalName: 'zygerrian-starhopper',
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Deal 2 indirect damage to a player',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 2 })
        });
    }
}
