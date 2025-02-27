import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import * as Contract from '../../../core/utils/Contract';

export default class DarthVaderCommandingTheFirstLegion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8506660490',
            internalName: 'darth-vader#commanding-the-first-legion'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Search the top 10 cards of your deck for any number of Villainy units with combined cost 3 or less and play each of them for free',
            immediateEffect: AbilityHelper.immediateEffects.playMultipleCardsFromDeck({
                activePromptTitle: 'Choose any units with combined cost 3 or less to play for free',
                searchCount: 10,
                selectCount: 10,
                cardCondition: (card) => card.isUnit() && card.hasSomeAspect(Aspect.Villainy),
                multiSelectCondition: (card, currentlySelectedCards) => this.costSum(currentlySelectedCards.concat(card)) <= 3
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
