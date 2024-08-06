const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { CardTypes, Players } = require('../../../Constants.js');

class ShosuroBotanist extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Return attachment to owners hand',
            target: {
                cardType: CardTypes.Attachment,
                controller: Players.Self,
                cardCondition: card => !card.hasTrait('weapon'),
                gameAction: AbilityDsl.actions.returnToHand()
            },
            effect: 'return {0} to {1}\'s hand',
            effectArgs: context => [context.target.owner]
        });
    }
}

ShosuroBotanist.id = 'shosuro-botanist';
module.exports = ShosuroBotanist;
