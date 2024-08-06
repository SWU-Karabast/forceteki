const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations } = require('../../Constants');

class KeenWarrior extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw 2 cards and return 1',
            when: {
                onCardRevealed: (event, context) => {
                    let cards = event.card;
                    if(!Array.isArray(cards)) {
                        cards = [cards];
                    }

                    return cards.some(a => a.location === Locations.Hand && a.controller === context.player.opponent);
                },
                onLookAtCards: (event, context) => {
                    let cards = event.stateBeforeResolution;
                    if(!Array.isArray(cards)) {
                        cards = [cards];
                    }

                    return cards.some(a => a.location === Locations.Hand && a.card.controller === context.player.opponent);
                }
            },
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.draw(context => ({ target: context.player, amount: 2 })),
                AbilityDsl.actions.chosenReturnToDeck(context => ({
                    target: context.player,
                    targets: false,
                    shuffle: false,
                    bottom: true,
                    amount: 1
                }))
            ]),
            effect: 'draw 2 cards, then place a card on the bottom of their deck'
        });
    }
}

KeenWarrior.id = 'keen-warrior';

module.exports = KeenWarrior;
