const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { AbilityTypes, Locations } = require('../../Constants');

class ShojusDiviner extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                title: 'Divine your conflict deck',
                printedAbility: false,
                condition: context => context.player.conflictDeck.size() > 0,
                effect: 'look at the top 8 cards of their conflict deck',
                gameAction: AbilityDsl.actions.handler({
                    handler: context => {
                        const cards = context.player.conflictDeck.first(8);
                        const chosenCards = [];

                        this.selectPrompt(context, cards, chosenCards);
                    }
                })
            })
        });
    }

    selectPrompt(context, cards, chosenCards) {
        if(!cards || cards.length <= 0) {
            return;
        }

        let cardHandler = currentCard => {
            cards = cards.filter(a => a !== currentCard);
            chosenCards.push(currentCard);
            this.promptWithMenu(context, cards, chosenCards, cardHandler);
        };

        this.promptWithMenu(context, cards, chosenCards, cardHandler);

    }

    promptWithMenu(context, cards, chosenCards, cardHandler) {
        if(!cards || cards.length <= 0) {
            this.handleCards(context, cards, chosenCards);
            return;
        }

        let promptInfo = 'on top of your deck';
        if(chosenCards.length > 0) {
            promptInfo = `under ${chosenCards[chosenCards.length - 1].name}`;
        }
        let prompt = `Select the card to put ${promptInfo}`;

        this.game.promptWithHandlerMenu(context.player, {
            activePromptTitle: prompt,
            context: context,
            cards: cards,
            cardHandler: cardHandler,
            choices: ['Discard the rest'],
            handlers: [() => {
                this.handleCards(context, cards, chosenCards);
            }]
        });
    }

    handleCards(context, cards, chosenCards) {
        if(cards && cards.length > 0) {
            this.game.addMessage('{0} discards {1}', context.player, cards);
            cards.forEach(card => context.player.moveCard(card, Locations.ConflictDiscardPile));
        }
        if(chosenCards.length > 0) {
            this.game.addMessage('{0} places {1} card{2} on top of their deck', context.player, chosenCards.length, chosenCards.length > 1 ? 's' : '');
            context.player.conflictDeck.splice(0, chosenCards.length, ...chosenCards);
        }
    }
}

ShojusDiviner.id = 'shoju-s-diviner';

module.exports = ShojusDiviner;
