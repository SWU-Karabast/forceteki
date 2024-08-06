const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class DaidojiStrategist extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move an honored character home',
            condition: context => context.source.isParticipating(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: card => card.isHonored,
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}

DaidojiStrategist.id = 'daidoji-strategist';
module.exports = DaidojiStrategist;

