const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ShadowStalker extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.player.honor <= 6,
            effect: AbilityDsl.effects.modifyBothSkills(2)
        });
    }
}

ShadowStalker.id = 'shadow-stalker';

module.exports = ShadowStalker;

