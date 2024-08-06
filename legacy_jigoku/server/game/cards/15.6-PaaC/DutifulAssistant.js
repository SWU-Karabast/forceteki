const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class DutifulAssistant extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            condition: context => context.source.parent && context.source.parent.isHonored,
            effect: AbilityDsl.effects.modifyGlory(2)
        });
    }
}

DutifulAssistant.id = 'dutiful-assistant';

module.exports = DutifulAssistant;
