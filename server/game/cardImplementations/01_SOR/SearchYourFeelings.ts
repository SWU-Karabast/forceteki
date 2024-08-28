import AbilityHelper from '../../AbilityHelper';
import { EventCard } from '../../core/card/EventCard';

export default class SearchYourFeelings extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7485151088',
            internalName: 'search-your-feelings',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search your deck for a card, draw it, then shuffle',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                shuffleWhenDone: true,
                revealSelected: false,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

SearchYourFeelings.implemented = true;