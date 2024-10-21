import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode, Trait } from '../../../core/Constants';

export default class ThisIsTheWay extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9845101935',
            internalName: 'this-is-the-way'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search the top 8 cards for up to 2 Mandalorian and/or upgrade cards, reveal them, and draw them',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 8,
                cardCondition: (card) => card.hasSomeTrait(Trait.Mandalorian) || card.isUpgrade(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

ThisIsTheWay.implemented = true;
