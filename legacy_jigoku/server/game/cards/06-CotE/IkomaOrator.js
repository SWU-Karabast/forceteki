const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class IkomaOrator extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.player.opponent && context.player.isMoreHonorable(),
            effect: AbilityDsl.effects.modifyPoliticalSkill(2)
        });
    }
}

IkomaOrator.id = 'ikoma-orator';

module.exports = IkomaOrator;
