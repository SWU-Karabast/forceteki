import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, TargetMode } from '../../../core/Constants';

export default class AidFromTheInnocent extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7510418786',
            internalName: 'aid-from-the-innocent',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Search the top 10 cards of your deck for 2 Heroism non-unit cards and discard them. For this phase, you may play the discarded cards, and they each cost 2 less.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                targetMode: TargetMode.UpTo,
                selectCount: 2,
                searchCount: 10,
                cardCondition: (card) => !card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect((deckSearchContext) => ({
                        effect: [
                            AbilityHelper.ongoingEffects.canPlayFromDiscard(),
                            AbilityHelper.ongoingEffects.forFree({
                                match: (card) => deckSearchContext.selectedPromptCards.includes(card) // note cost adjusters are attached to player, so have to refilter
                            })
                        ]
                    }))
                ])
            })
            // , TODO: remove if not needed
            // then: {
            //     title: 'If this unit isn’t unique, discard a card from your hand',
            //     immediateEffect: AbilityHelper.immediateEffects.conditional({
            //         condition: (context) => !context.source.unique,
            //         onTrue: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
            //             cardTypeFilter: WildcardCardType.Any,
            //             target: context.player,
            //             amount: 1
            //         })),
            //         onFalse: AbilityHelper.immediateEffects.noAction()
            //     })
            // }
        });
    }
}
