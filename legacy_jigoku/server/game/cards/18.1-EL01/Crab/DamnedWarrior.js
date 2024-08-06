const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl');

class DamnedWarrior extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Ready this character',
            cost: AbilityDsl.costs.taintSelf(),
            gameAction: AbilityDsl.actions.ready()
        });
    }
}

DamnedWarrior.id = 'damned-warrior';

module.exports = DamnedWarrior;
