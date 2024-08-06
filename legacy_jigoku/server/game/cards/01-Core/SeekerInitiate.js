const DrawCard = require('../../drawcard.js');
const { Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class SeekerInitiate extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Look at top 5 cards',
            when: {
                onClaimRing: (event, context) => context.player.role && ((event.conflict && event.conflict.elements.some(element => context.player.role.hasTrait(element))) || context.player.role.hasTrait(event.ring.element)) &&
                                                 event.player === context.player && context.player.conflictDeck.size() > 0
            },
            effect: 'look at the top 5 cards of their conflict deck',
            gameAction: AbilityDsl.actions.deckSearch({
                amount: 5,
                reveal: false,
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                })
            })
        });
    }
}

SeekerInitiate.id = 'seeker-initiate';

module.exports = SeekerInitiate;
