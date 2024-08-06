const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class InHarmony extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'removeFate',
                restricts: 'cardAndRingEffects'
            })
        });
    }

    canPlay(context) {
        return context.player.getClaimedRings().length >= 1;
    }
}

InHarmony.id = 'in-harmony';

module.exports = InHarmony;
