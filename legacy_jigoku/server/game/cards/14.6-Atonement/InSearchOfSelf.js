const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class InSearchOfSelf extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow attacking character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isAttacking() && card.costLessThan(context.player.getNumberOfFacedownProvinces() + 1),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}

InSearchOfSelf.id = 'in-search-of-self';

module.exports = InSearchOfSelf;
