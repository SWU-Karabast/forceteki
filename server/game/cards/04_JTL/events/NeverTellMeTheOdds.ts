import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName, WildcardCardType } from '../../../core/Constants';

export default class NeverTellMeTheodds extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8833191722',
            internalName: 'never-tell-me-the-odds',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Discard three cards from your deck and an opponent\'s deck, then deal damage to a unit equal to the number of odd-cost cards that were discarded',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 3,
                target: [context.source.owner, context.source.owner.opponent]
            })),
            ifYouDo: (ifYouDoContext) => {
                const oddCostCount = this.getOddCostCountFromEvents(ifYouDoContext.events);
                return {
                    title: `Deal damage to a unit equal to number of odd-cost cards discarded (${oddCostCount} damage)`,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: oddCostCount })
                    }
                };
            }
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
