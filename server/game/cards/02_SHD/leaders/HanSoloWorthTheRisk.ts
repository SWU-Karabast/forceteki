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
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                canChooseNoCards: false,
                immediateEffect: /*AbilityHelper.immediateEffects.sequential([*/
                    AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                    })//,
                    // AbilityHelper.immediateEffects.damage((context) => ({
                    //     amount: 2,
                    //     target: context.target
                    // }))
              //  ])
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addActionAbility({
            title: 'Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                canChooseNoCards: false,
                immediateEffect:// AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                    })//,
                    // AbilityHelper.immediateEffects.damage((context) => ({
                    //     amount: 2,
                    //     target: context.target
                    // }))
                // ])
            }
        });
    }
}

HanSoloWorthTheRisk.implemented = true;
