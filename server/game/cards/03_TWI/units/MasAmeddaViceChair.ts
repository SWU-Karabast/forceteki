import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MasAmeddaViceChair extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0142631581',
            internalName: 'mas-amedda#vice-chair',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Exhaust this unit',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.isUnit() &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Search the top 4 cards of your deck for a unit, reveal it, and draw it',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    selectCount: 1,
                    searchCount: 4,
                    cardCondition: (card) => card.isUnit(),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
                })
            }
        });
    }
}