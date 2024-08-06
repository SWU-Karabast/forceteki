const DrawCard = require('../../drawcard.js');
const { Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class TatteredMissive extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true,
            trait: 'courtier'
        });

        this.action({
            title: 'Search top 5 cards',
            condition: context => context.player.conflictDeck.size() > 0,
            cost: AbilityDsl.costs.bowParent(),
            effect: 'look at the top 5 cards of their conflict deck',
            gameAction: AbilityDsl.actions.deckSearch({
                amount: 5,
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                })
            })
        });
    }
}

TatteredMissive.id = 'tattered-missive';

module.exports = TatteredMissive;
