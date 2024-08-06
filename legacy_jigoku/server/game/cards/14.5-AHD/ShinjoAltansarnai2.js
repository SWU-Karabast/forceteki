const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ShinjoAltansarnai2 extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put a character into play',
            condition: (context) => this.game.isDuringConflict('military') && context.source.isParticipating(),
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose a character that costs 3 or less',
                    cards: context.player.dynastyDeck.first(8),
                    cardCondition: (card) =>
                        card.type === CardTypes.Character &&
                        card.printedCost <= 3 &&
                        !card.isUnique() &&
                        card.allowGameAction('putIntoConflict', context),
                    choices: ['Don\'t choose a character'],
                    handlers: [
                        function () {
                            context.game.addMessage('{0} chooses not to put a character into play', context.player);
                        }
                    ],
                    subActionProperties: (card) => ({ target: card }),
                    message: '{0} chooses to put {1} into the conflict',
                    messageArgs: (card, player) => [player, card],
                    gameAction: AbilityDsl.actions.putIntoConflict()
                })),
                AbilityDsl.actions.shuffleDeck((context) => ({
                    deck: Locations.DynastyDeck,
                    target: context.player
                }))
            ]),
            effect: 'search the top 8 cards of their dynasty deck for a character that costs 3 or less and put it into the conflict'
        });
    }
}

ShinjoAltansarnai2.id = 'shinjo-altansarnai-2';

module.exports = ShinjoAltansarnai2;
