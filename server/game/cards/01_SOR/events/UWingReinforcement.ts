import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import * as Contract from '../../../core/utils/Contract';

export default class UWingReinforcement extends EventCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId () {
        return {
            id: '8968669390',
            internalName: 'uwing-reinforcement',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Search the top 10 cards of your deck for up to 3 units with combined cost 7 or less and play each of them for free',
            immediateEffect: AbilityHelper.immediateEffects.playMultipleCardsFromDeck({
                activePromptTitle: 'Choose up to 3 units with combined cost 7 or less to play for free',
                searchCount: 10,
                selectCount: 3,
                cardCondition: (card) => card.isUnit(),
                multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 7
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
