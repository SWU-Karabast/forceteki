import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, RelativePlayer, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class BibFortunaJabbasMajordomo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7870435409',
            internalName: 'bib-fortuna#jabbas-majordomo',
        };
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Play an event from your hand. It costs 1 less.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: CardType.Event,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                })
            }
        });
    }
}

BibFortunaJabbasMajordomo.implemented = true;
