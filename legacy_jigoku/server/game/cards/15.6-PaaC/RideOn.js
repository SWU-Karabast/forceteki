const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players, CardTypes } = require('../../Constants');

class RideOn extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a character into or out of the conflict',
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: card => card.hasTrait('cavalry'),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.sendHome(),
                    AbilityDsl.actions.moveToConflict()
                ])
            }
        });
    }
}

RideOn.id = 'ride-on';

module.exports = RideOn;
