import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Location, TargetMode, Trait } from '../../core/Constants';

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
            optional: false,
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                selectCardCount: 2,
                cardsToSearch: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                immediateEffect: AbilityHelper.immediateEffects.moveCard({
                    destination: Location.Hand
                })
            })
        });
    }
}

GrandMoffTarkinDeathStarOverseer.implemented = true;