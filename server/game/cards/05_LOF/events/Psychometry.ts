import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class Psychometry extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0978531185',
            internalName: 'psychometry'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose another card in your discard pile. Search the top 5 cards of your deck for a card that shares a Trait with the chosen card, reveal it, and draw it.',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardCondition: (card, context) => card !== context.source
            },
            then: (context) => ({
                title: 'Search the top 5 cards of your deck for a card that shares a Trait with the chosen card, reveal it, and draw it.',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 5,
                    cardCondition: (card) => card.hasSomeTrait(context.target.traits),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            })
        });
    }
}