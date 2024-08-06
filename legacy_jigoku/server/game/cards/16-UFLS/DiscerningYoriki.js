const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class DiscerningYoriki extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor a character',
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
            target: {
                activePromptTitle: 'Choose a character to honor',
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}

DiscerningYoriki.id = 'discerning-yoriki';

module.exports = DiscerningYoriki;
