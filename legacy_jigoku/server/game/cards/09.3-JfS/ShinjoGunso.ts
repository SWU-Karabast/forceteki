import { PlayTypes, Decks, CardTypes, Locations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class ShinjoGunso extends DrawCard {
    static id = 'shinjo-gunso';

    setupCardAbilities() {
        this.reaction({
            title: 'Put a character into play',
            when: {
                onCardPlayed: (event, context) =>
                    event.playType === PlayTypes.PlayFromProvince &&
                    event.card === context.source &&
                    context.game.getProvinceArray().includes(event.originalLocation)
            },
            effect: 'search the top 5 cards of their dynasty deck for a character that costs 2 or less and put it into play',
            gameAction: AbilityDsl.actions.sequentialContext((context) => {
                const topFive = context.player.dynastyDeck.first(5);
                return {
                    gameActions: [
                        AbilityDsl.actions.deckSearch(() => ({
                            activePromptTitle: 'Choose a character to put into play',
                            amount: 5,
                            deck: Decks.DynastyDeck,
                            cardCondition: (card) => card.type === CardTypes.Character && card.printedCost <= 2,
                            message: '{0} puts {1} into play{2}{3}',
                            shuffle: false,
                            messageArgs: (context, cards) => {
                                const discards = topFive.filter((a) => !cards.includes(a));
                                const card = cards.length > 0 ? cards : 'nothing';
                                return [context.player, card, discards.length > 0 ? ' and discards ' : '', discards];
                            },
                            gameAction: AbilityDsl.actions.putIntoPlay()
                        })),
                        AbilityDsl.actions.moveCard((context2) => ({
                            target: topFive.filter((a) => {
                                const events = context2.events.filter((a) => a.name === 'onDeckSearch' && !a.cancelled);
                                if (events.length > 0 && events[0].selectedCards) {
                                    return !events[0].selectedCards.includes(a);
                                }
                                return true;
                            }),
                            faceup: true,
                            destination: Locations.DynastyDiscardPile
                        }))
                    ]
                };
            })
        });
    }
}
