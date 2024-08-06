const DrawCard = require('../../drawcard.js');

class BlessedByFukurokujin extends DrawCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.cardCannot('receiveDishonorToken')
        });
    }
}

BlessedByFukurokujin.id = 'blessed-by-fukurokujin';

module.exports = BlessedByFukurokujin;
