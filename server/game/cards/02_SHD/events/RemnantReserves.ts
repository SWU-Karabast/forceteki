import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode } from '../../../core/Constants';

export default class RemnantReserves extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1565760222',
            internalName: 'remnant-reserves'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search the top 5 cards for up to 3 units, reveal them, and draw them',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 3,
                searchCount: 5,
                cardCondition: (card) => card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

RemnantReserves.implemented = true;
