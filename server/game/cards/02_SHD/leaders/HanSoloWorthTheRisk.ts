import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class HanSoloWorthTheRisk extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9226435975',
            internalName: 'han-solo#worth-the-risk',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                        playAsType: WildcardCardType.Unit
                    }),
                    AbilityHelper.immediateEffects.damage({
                        amount: 2
                    })
                ])
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.',
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                        playAsType: WildcardCardType.Unit
                    }),
                    AbilityHelper.immediateEffects.damage((context) => ({
                        amount: 2,
                        target: context.target
                    }))
                ])
            }
        });
    }
}
