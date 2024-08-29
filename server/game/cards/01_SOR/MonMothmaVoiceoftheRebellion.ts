import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { Trait } from '../../core/Constants';

export default class MonMothmaVoiceoftheRebellion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3498814896',
            internalName: 'mon-mothma#voice-of-the-rebellion'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for a Rebel card, then reveal and draw it.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card) => card.hasSomeTrait(Trait.Rebel),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}

MonMothmaVoiceoftheRebellion.implemented = true;