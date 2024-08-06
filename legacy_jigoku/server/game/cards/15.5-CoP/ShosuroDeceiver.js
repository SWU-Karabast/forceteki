const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ShosuroDeceiver extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isParticipating(),
            effect: AbilityDsl.effects.gainAllAbilitiesDynamic((card, context) => {
                return context.game.currentConflict.getParticipants(a => a.isDishonored && a !== card);
            })
        });
    }
}

ShosuroDeceiver.id = 'shosuro-deceiver';

module.exports = ShosuroDeceiver;
