const DrawCard = require('../../drawcard.js');
const { Decks, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class FavorableDealbroker extends DrawCard {
    setupCardAbilities() {
        this.chosenCard = null;
        this.reaction({
            title: 'Put a character into play',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            effect: 'search their dynasty deck for a character that costs 1 and put it into play',
            gameAction: AbilityDsl.actions.deckSearch({
                activePromptTitle: 'Choose a character to put into play ',
                deck: Decks.DynastyDeck,
                cardCondition: (card) => card.type === CardTypes.Character && card.printedCost === 1,
                gameAction: AbilityDsl.actions.putIntoPlay()
            })
        });
    }
}

FavorableDealbroker.id = 'favorable-dealbroker';

module.exports = FavorableDealbroker;
