const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class TetsuboOfBlod extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot('honor')
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

TetsuboOfBlod.id = 'tetsubo-of-blood';

module.exports = TetsuboOfBlod;
