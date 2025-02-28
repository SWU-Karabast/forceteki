import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class GrandMoffTarkinDeathStarOverseer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9266336818',
            internalName: 'grand-moff-tarkin#death-star-overseer'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for up to 2 Imperial cards, then reveal and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                selectCount: 2,
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
