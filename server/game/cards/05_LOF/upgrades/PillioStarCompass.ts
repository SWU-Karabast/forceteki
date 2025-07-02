import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class PillioStarCompass extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8580514429',
            internalName: 'pillio-star-compass',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addWhenPlayedAbility({
            title: 'Search the top 3 cards of your deck for a unit, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                selectCount: 1,
                searchCount: 3,
                cardCondition: (card) => card.isUnit(),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            }),
        });
    }
}