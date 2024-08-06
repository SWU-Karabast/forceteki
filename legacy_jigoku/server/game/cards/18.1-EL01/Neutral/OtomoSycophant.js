const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');

class OtomoSycophant extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor Self',
            condition: context => context.player.imperialFavor !== '',
            gameAction: AbilityDsl.actions.honor()
        });
    }
}

OtomoSycophant.id = 'otomo-sycophant';
module.exports = OtomoSycophant;
