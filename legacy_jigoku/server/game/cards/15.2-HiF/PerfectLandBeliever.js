const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class PerfectLandBeliever extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isOrdinary(),
            match: (card, context) => card === context.source,
            effect: AbilityDsl.effects.modifyBothSkills(2)
        });
    }
}

PerfectLandBeliever.id = 'perfect-land-believer';

module.exports = PerfectLandBeliever;
