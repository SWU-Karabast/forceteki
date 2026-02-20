import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, EventName, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class DaringDelve extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9273364323',
            internalName: 'daring-delve',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Discard 2 cards from your deck. You may return a Aggression card discarded this way to your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 2,
                target: context.player
            })),
            then: (thenContext) => {
                const discardedAggressionCards = thenContext.events
                    .filter((event) => event.name === EventName.OnCardDiscarded)
                    .map((event) => event.card)
                    .filter((card) => card.hasSomeAspect(Aspect.Aggression));

                return {
                    title: 'Return a discarded Aggression card to your hand',
                    optional: true,
                    targetResolver: {
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Discard,
                        cardCondition: (card) => discardedAggressionCards.includes(card),
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }
                };
            }
        });
    }
}
