const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class DamnedHida extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.modifyMilitarySkill(3)
        });
    }
}

DamnedHida.id = 'damned-hida';

module.exports = DamnedHida;
