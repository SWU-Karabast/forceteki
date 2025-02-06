import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, ZoneName, Trait } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AdmiralPiettCommandingTheArmada extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4030832630',
            internalName: 'admiral-piett#commanding-the-armada',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a Capital Ship unit from your hand. It costs 1 resource less',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.CapitalShip),
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addActionAbility({
            title: 'Play a Capital Ship unit from your hand. It costs 2 resources less',
            targetResolver: {
                cardTypeFilter: CardType.BasicUnit,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
                }),
            }
        });
    }
}


