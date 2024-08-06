const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class VeteranOfToshiRanbo extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.modifyGlory(() => this.controller ? this.controller.getNumberOfFaceupProvinces() : 0)
        });
    }
}

VeteranOfToshiRanbo.id = 'veteran-of-toshi-ranbo';

module.exports = VeteranOfToshiRanbo;
