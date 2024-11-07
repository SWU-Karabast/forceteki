import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Location } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class AllianceDispatcher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2756312994',
            internalName: 'alliance-dispatcher',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Play a unit from your hand. It costs 1 less',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: CardType.BasicUnit,
                locationFilter: Location.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    costAdjusterProperties: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                })
            }
        });
    }
}

AllianceDispatcher.implemented = true;
