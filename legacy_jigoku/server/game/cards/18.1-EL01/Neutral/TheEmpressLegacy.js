const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');

class TheEmpressLegacy extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.parent && context.source.parent.isFaction('crab'),
            effect: AbilityDsl.effects.changePlayerGloryModifier(1)
        });

        this.whileAttached({
            effect: AbilityDsl.effects.canContributeGloryWhileBowed()
        });
    }
}

TheEmpressLegacy.id = 'the-empress-legacy';

module.exports = TheEmpressLegacy;


