import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { Trait } from '../../../core/Constants';

export default class LuthenRaelMasqueradingAntiquarian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5472129982',
            internalName: 'luthen-rael#masquerading-antiquarian',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Search the top 5 of your deck for an item upgrade',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Item),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}