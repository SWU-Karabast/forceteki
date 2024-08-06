const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');

class Yuta extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Steal a fate',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && context.source.isAttacking()
            },
            gameAction: AbilityDsl.actions.takeFate()
        });
    }
}

Yuta.id = 'yuta';
module.exports = Yuta;
