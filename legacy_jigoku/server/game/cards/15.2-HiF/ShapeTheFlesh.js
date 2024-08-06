const AbilityDsl = require('../../abilitydsl');
const DrawCard = require('../../drawcard.js');

class ShapeTheFlesh extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: [
                AbilityDsl.effects.cardCannot('honor'),
                AbilityDsl.effects.addKeyword('covert')
            ]
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

ShapeTheFlesh.id = 'shape-the-flesh';

module.exports = ShapeTheFlesh;

