const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class DispatchToNowhere extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard a character with no fate',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.getFate() === 0,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }
}

DispatchToNowhere.id = 'dispatch-to-nowhere';

module.exports = DispatchToNowhere;
