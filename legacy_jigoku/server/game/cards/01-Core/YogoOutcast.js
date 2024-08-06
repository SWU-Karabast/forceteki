const DrawCard = require('../../drawcard.js');

class YogoOutcast extends DrawCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: context => context.player.isLessHonorable(),
            effect: ability.effects.modifyBothSkills(1)
        });
    }
}

YogoOutcast.id = 'yogo-outcast';

module.exports = YogoOutcast;

