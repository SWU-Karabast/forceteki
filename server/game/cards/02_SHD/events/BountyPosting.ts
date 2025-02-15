import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { ICardWithCostProperty } from '../../../core/card/propertyMixins/Cost';
import { Trait } from '../../../core/Constants';

export default class BountyPosting extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6151970296',
            internalName: 'bounty-posting',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search your deck for a Bounty upgrade, reveal it, and draw it (shuffle your deck)',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Bounty),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard(),
                shuffleWhenDone: true
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Play that upgrade (paying its cost)',
                ifYouDoCondition: () =>
                    ifYouDoContext.selectedPromptCards.length === 1 &&
                    ifYouDoContext.player.readyResourceCount >= (ifYouDoContext.selectedPromptCards[0] as ICardWithCostProperty).cost,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    target: ifYouDoContext.selectedPromptCards[0]
                })
            })
        });
    }
}
