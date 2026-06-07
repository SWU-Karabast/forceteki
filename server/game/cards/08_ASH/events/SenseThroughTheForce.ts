import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, Trait } from '../../../core/Constants';

export default class SenseThroughTheForce extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1227888563',
            internalName: 'sense-through-the-force',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a number',
            targetResolver: {
                mode: TargetMode.ChooseNumber,
                min: 0,
                max: 20,
                condition: (context) => context.player.drawDeck.length > 0   // skip ability if deck is empty
            },
            then: (thenContext) => ({
                title: 'Search the top 5 cards of your deck for a card, reveal it, and draw it.',
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 5,
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.revealAndDraw({
                            useDisplayPrompt: true,
                            promptedPlayer: RelativePlayer.Opponent
                        }),
                        AbilityHelper.immediateEffects.conditional({
                            condition: (context) => context.selectedPromptCards[0].hasCost() && context.selectedPromptCards[0].cost === parseInt(thenContext.select),
                            onTrue: AbilityHelper.immediateEffects.selectCard({
                                activePromptTitle: 'Give 3 Advantage tokens to a Force unit',
                                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                                immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({ amount: 3 })
                            })
                        })
                    ])
                })
            })
        });
    }
}