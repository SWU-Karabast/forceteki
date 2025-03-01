import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { EventName, WildcardCardType } from '../../../core/Constants';

export default class NeverTellMeTheodds extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8833191722',
            internalName: 'never-tell-me-the-odds',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Discard three cards from your deck and an opponent\'s deck, then deal damage to a unit equal to the number of odd-cost cards that were discarded',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 3,
                    target: context.source.owner
                })),
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 3,
                    target: context.source.owner.opponent
                }))
            ]),
            ifYouDo: (ifYouDoContext) => ({
                title: `Deal damage to a unit equal to the cost of ${ifYouDoContext.events[0]?.card?.title} (${ifYouDoContext.events[0]?.card?.printedCost} damage)`,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: this.getOddCostCountFromEvents(ifYouDoContext.events) })
                }
            })
        });
    }

    private getOddCostCountFromEvents(events: any[]): number {
        let oddCostCount = 0;
        const discardedCards = events.filter((event) => event.name === EventName.OnCardDiscarded).map((event) => event.card);
        for (const card of discardedCards) {
            if (card.cost % 2 !== 0) {
                oddCostCount++;
            }
        }
        return oddCostCount;
    }
}
