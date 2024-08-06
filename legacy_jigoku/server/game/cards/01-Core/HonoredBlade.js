const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class HonoredBlade extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Gain 1 honor',
            when: {
                afterConflict: (event, context) => context.source.parent && context.source.parent.isParticipating() &&
                                                   event.conflict.winner === context.source.parent.controller
            },
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }
}

HonoredBlade.id = 'honored-blade';

module.exports = HonoredBlade;
