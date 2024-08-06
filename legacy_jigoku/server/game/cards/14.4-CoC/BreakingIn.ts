import { CardTypes, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';

export default class BreakingIn extends ProvinceCard {
    static id = 'breaking-in';

    setupCardAbilities() {
        this.reaction({
            title: 'Search for a character card',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            handler: (context) =>
                this.game.promptWithHandlerMenu(context.player, {
                    activePromptTitle: 'Select a card:',
                    context: context,
                    cards: context.player.dynastyDeck.first(8).filter((card) => card.type === CardTypes.Character),
                    choices: ['Select nothing'],
                    handlers: [() => this.game.addMessage('{0} selects nothing from their deck', context.player)],
                    cardHandler: (cardFromDeck) => {
                        if (cardFromDeck.hasTrait('cavalry')) {
                            return this.game.promptForSelect(context.player, {
                                activePromptTitle: 'Choose a province',
                                context: context,
                                cardType: [CardTypes.Province],
                                location: Locations.Provinces,
                                controller: Players.Self,
                                onSelect: (player, card) => {
                                    this.game.addMessage(
                                        '{0} places {1} in {2}',
                                        context.player,
                                        cardFromDeck,
                                        card.facedown ? card.location : card
                                    );
                                    player.moveCard(cardFromDeck, card.location);
                                    cardFromDeck.facedown = false;
                                    player.shuffleDynastyDeck();
                                    return true;
                                }
                            });
                        }
                        context.player.moveCard(cardFromDeck, context.source.location);
                        cardFromDeck.facedown = false;
                        this.game.addMessage('{0} places {1} in {2}', context.player, cardFromDeck, context.source);
                        context.player.shuffleDynastyDeck();
                        return true;
                    }
                }),
            effect: 'choose a character to place in a province'
        });
    }
}
