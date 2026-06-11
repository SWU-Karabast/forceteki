import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class SearchYourFeelings extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7485151088',
            internalName: 'search-your-feelings',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Search your deck for a card, draw it, then shuffle',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                shuffleWhenDone: true,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
