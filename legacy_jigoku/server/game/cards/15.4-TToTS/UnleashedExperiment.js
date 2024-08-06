const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class UnleashedExperiment extends DrawCard {
    setupCardAbilities() {
        this.dire({
            effect: AbilityDsl.effects.loseAllNonKeywordAbilities()
        });

        this.persistentEffect({
            effect: AbilityDsl.effects.honorCostToDeclare(2)
        });
    }
}

UnleashedExperiment.id = 'unleashed-experiment';

module.exports = UnleashedExperiment;
