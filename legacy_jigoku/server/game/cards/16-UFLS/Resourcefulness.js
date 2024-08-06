const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class Resourcefulness extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor a character',
            cost: AbilityDsl.costs.dishonor(),
            target: {
                activePromptTitle: 'Choose a character to honor',
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}

Resourcefulness.id = 'resourcefulness';

module.exports = Resourcefulness;
