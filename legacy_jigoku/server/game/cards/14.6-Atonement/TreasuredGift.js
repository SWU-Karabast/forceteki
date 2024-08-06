const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class TeasuredGift extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            opponentControlOnly: true
        });

        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot('declareAsAttacker')
        });
    }
}

TeasuredGift.id = 'treasured-gift';

module.exports = TeasuredGift;

