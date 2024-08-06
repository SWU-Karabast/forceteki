import { CardTypes, Decks, Durations, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class SpectralVisitation extends ProvinceCard {
    static id = 'spectral-visitation';

    setupCardAbilities() {
        this.reaction({
            title: 'put a character from your discard pile into play',
            cannotTargetFirst: true,
            when: {
                onCardRevealed: (event, context) => context.source === event.card
            },
            cost: [AbilityDsl.costs.discardTopCardsFromDeck({ amount: 4, deck: Decks.DynastyDeck })],
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.handler({
                    handler: () => true
                }),
                AbilityDsl.actions.selectCard((context) => ({
                    location: Locations.DynastyDiscardPile,
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    targets: true,
                    gameAction: AbilityDsl.actions.multiple([
                        AbilityDsl.actions.putIntoPlay(),
                        AbilityDsl.actions.cardLastingEffect((context) => ({
                            duration: Durations.UntilEndOfRound,
                            effect: AbilityDsl.effects.delayedEffect({
                                when: {
                                    onPhaseEnded: () => true
                                },
                                message: "{0} returns to the bottom of the deck due to {1}'s effect",
                                messageArgs: (effectContext, effectTargets) => [effectTargets, context.source],
                                gameAction: AbilityDsl.actions.returnToDeck({ bottom: true })
                            })
                        }))
                    ]),
                    message:
                        "{0} puts {1} into play. {1} will be put on the bottom of the deck if it's still in play by the end of the phase",
                    messageArgs: (card) => [context.player, card, context.source]
                }))
            ]),
            effect: 'put a dynasty character into play'
        });
    }
}
