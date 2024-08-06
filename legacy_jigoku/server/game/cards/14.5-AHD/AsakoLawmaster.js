const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class AsakoLawmaster extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Gain an honor',
            when: {
                onConflictPass: (event, context) => event.conflict.attackingPlayer === context.player
            },
            gameAction: AbilityDsl.actions.gainHonor(context => ({
                target: context.player
            }))
        });
    }
}

AsakoLawmaster.id = 'asako-lawmaster';

module.exports = AsakoLawmaster;
