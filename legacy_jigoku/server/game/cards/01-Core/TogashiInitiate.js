const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class TogashiInitiate extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor this character',
            condition: context => context.source.isAttacking(),
            cost: AbilityDsl.costs.payFateToRing(1),
            gameAction: AbilityDsl.actions.honor()
        });
    }
}

TogashiInitiate.id = 'togashi-initiate';

module.exports = TogashiInitiate;
