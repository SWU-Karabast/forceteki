import { CardTypes, Durations, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { AbilityContext } from '../../../AbilityContext';

function cardsToDiscard(context: AbilityContext) {
    return context.player.dynastyDeck.first(4);
}

export default class SecondWind extends DrawCard {
    static id = 'second-wind';

    public setupCardAbilities() {
        this.action({
            title: 'put a character from your discard pile into play',
            cannotTargetFirst: true,
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.discardCard((context) => ({
                    target: cardsToDiscard(context)
                })),
                AbilityDsl.actions.selectCard((context) => ({
                    location: Locations.DynastyDiscardPile,
                    cardType: CardTypes.Character,
                    cardCondition: (card) => !card.isUnique(),
                    cntroller: Players.Self,
                    targets: true,
                    gameAction: AbilityDsl.actions.multiple([
                        AbilityDsl.actions.putIntoConflict(),
                        AbilityDsl.actions.cardLastingEffect(() => ({
                            duration: Durations.UntilEndOfPhase,
                            location: [Locations.PlayArea],
                            effect: AbilityDsl.effects.delayedEffect({
                                when: {
                                    onConflictFinished: () => true
                                },
                                gameAction: AbilityDsl.actions.returnToDeck({ bottom: true })
                            })
                        }))
                    ]),
                    message:
                        "{0} puts {1} into play. {1} will be put on the bottom of the deck if it's still in play by the end of the conflict",
                    messageArgs: (card) => [context.player, card, context.source]
                }))
            ]),
            effect: 'find a character to put into play. {1} discards {2}',
            effectArgs: (context) => [context.player, cardsToDiscard(context)]
        });
    }
}
