const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');

class LiquidCourage extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.addKeyword('pride')
        });

        this.whileAttached({
            effect: [
                AbilityDsl.effects.mustBeDeclaredAsAttackerIfType('military'),
                AbilityDsl.effects.mustBeDeclaredAsDefender('military')
            ]
        });
    }
}

LiquidCourage.id = 'liquid-courage';
module.exports = LiquidCourage;
