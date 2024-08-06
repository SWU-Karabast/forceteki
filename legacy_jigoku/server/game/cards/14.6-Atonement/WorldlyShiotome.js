const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class WorldlyShiotome extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor this character',
            when: {
                onCardPlayed: (event, context) => event.card.hasTrait('gaijin') && event.player === context.player
            },
            gameAction: AbilityDsl.actions.honor()
        });
    }
}

WorldlyShiotome.id = 'worldly-shiotome';

module.exports = WorldlyShiotome;
