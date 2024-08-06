const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class OpenWindow extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a Shinobi into the conflict',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: card => card.hasTrait('shinobi'),
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}

OpenWindow.id = 'open-window';

module.exports = OpenWindow;
