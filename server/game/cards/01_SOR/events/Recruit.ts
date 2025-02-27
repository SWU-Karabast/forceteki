import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';

export default class Recruit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3407775126',
            internalName: 'recruit'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search the top 5 cards for a unit, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

