import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

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
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 2 })
            }
        });
    }
}
