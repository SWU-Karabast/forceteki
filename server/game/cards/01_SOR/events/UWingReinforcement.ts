import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import { PlayType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import * as Contract from '../../../core/utils/Contract';

export default class UWingReinforcement extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8968669390',
            internalName: 'uwing-reinforcement',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Search the top 10 cards of your deck for up to 3 units with combined cost 7 or less and play each of them for free',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                activePromptTitle: 'Choose up to 3 units with combined cost 7 or less to play for free',
                searchCount: 10,
                selectCount: 3,
                cardCondition: (card, _context, currentlySelectedCards) =>
                    card.isUnit() && this.costSum([...currentlySelectedCards, card]) <= 7,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.playCard({
                    playType: PlayType.PlayFromOutOfPlay,
                    nested: true,
                    adjustCost: {
                        costAdjustType: CostAdjustType.Free
                    }
                })
            })
        });
    }

    private costSum(cards: Card[]): number {
        let costSum = 0;
        for (const card of cards) {
            Contract.assertTrue(card.isUnit());
            costSum += card.cost;
        }
        return costSum;
    }
}

UWingReinforcement.implemented = true;
