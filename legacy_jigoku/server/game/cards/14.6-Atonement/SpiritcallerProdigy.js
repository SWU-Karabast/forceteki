const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, Players } = require('../../Constants');

class SpiritcallerProdigy extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Resurrect a character',
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                activePromptTitle: 'Choose a character from your dynasty discard pile',
                location: [Locations.DynastyDiscardPile],
                cardCondition: card => card.isFaction('lion') && card.costLessThan(4),
                controller: Players.Self,
                gameAction: AbilityDsl.actions.putIntoPlay()
            },
            effect: 'call {0} back from the dead'
        });
    }
}

SpiritcallerProdigy.id = 'spiritcaller-prodigy';

module.exports = SpiritcallerProdigy;
