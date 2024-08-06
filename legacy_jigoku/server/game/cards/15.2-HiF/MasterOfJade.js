const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class MasterOfJade extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Lose 2 honor to put a fate on a character',
            cost: AbilityDsl.costs.payHonor(2),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.placeFate({amount: 1})
            }
        });
    }
}

MasterOfJade.id = 'master-of-jade';

module.exports = MasterOfJade;
