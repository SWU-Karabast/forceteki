const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class LoyalOathbreaker extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.consideredLessHonorable()
        });
    }
}

LoyalOathbreaker.id = 'loyal-oathbreaker';

module.exports = LoyalOathbreaker;
