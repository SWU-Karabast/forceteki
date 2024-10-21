import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';

export default class Commission extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1141018768',
            internalName: 'commission'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search the top 10 cards for a Bounty Hunter, Item, or Transport card, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 10,
                cardCondition: (card) => card.hasSomeTrait([Trait.BountyHunter, Trait.Item, Trait.Transport]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

Commission.implemented = true;
