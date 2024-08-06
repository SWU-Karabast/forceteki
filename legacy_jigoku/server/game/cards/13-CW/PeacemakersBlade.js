const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class PeacemakersBlade extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: AbilityDsl.effects.cardCannot('declareAsAttacker')
        });
    }

    canPlayOn(card) {
        return (card.getType() === CardTypes.Character && !card.isAttacking()) && super.canPlayOn(card);
    }
}

PeacemakersBlade.id = 'peacemaker-s-blade';

module.exports = PeacemakersBlade;

