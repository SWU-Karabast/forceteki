const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class KuniPurifier extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Make opponent lose honor',
            when: {
                onConflictPass: (event, context) => event.conflict.attackingPlayer === context.player.opponent
            },
            gameAction: AbilityDsl.actions.discardAtRandom()
        });
    }
}

KuniPurifier.id = 'kuni-purifier';

module.exports = KuniPurifier;
