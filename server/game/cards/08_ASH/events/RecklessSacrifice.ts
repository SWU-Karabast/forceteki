import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class RecklessSacrifice extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8814113279',
            internalName: 'reckless-sacrifice',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Discard a unit from your hand. Deal 5 damage to a unit that costs more than the discarded card.',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player,
                cardCondition: (card) => card.isUnit()
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: `Deal 5 damage to a unit that costs more than ${ifYouDoContext.events[0]?.card?.printedCost ?? 0}`,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasCost() && (card.cost > (ifYouDoContext.events[0]?.card?.printedCost ?? 0)),
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 5 })
                }
            })
        });
    }
}