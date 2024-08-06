const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');


class LionsPrideParagon extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}

LionsPrideParagon.id = 'lion-s-pride-paragon';

module.exports = LionsPrideParagon;
