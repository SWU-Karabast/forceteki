import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class ShipbreakingYard extends BaseCard {
    protected override getImplementationId() {
        return {
            id: '2034527101',
            internalName: 'shipbreaking-yard',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Discard the top 3 cards of your deck. You may return a card discarded this way to the top of your deck',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 3,
                target: context.player
            })),
            then: (thenContext) => {
                const discardedCards = thenContext.events
                    .filter((event) => event.name === EventName.OnCardDiscarded)
                    .map((event) => event.card);

                return {
                    title: 'Return a discarded card to the top of your deck',
                    optional: true,
                    targetResolver: {
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Discard,
                        cardCondition: (card) => discardedCards.includes(card),
                        immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                    }
                };
            }
        });
    }
}