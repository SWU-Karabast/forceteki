const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class AtAnyCost extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Place a fate on a character',
            cost: AbilityDsl.costs.payHonor(3),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.placeFate({ amount: 2 })
            }
        });
    }
}

AtAnyCost.id = 'at-any-cost';

module.exports = AtAnyCost;
