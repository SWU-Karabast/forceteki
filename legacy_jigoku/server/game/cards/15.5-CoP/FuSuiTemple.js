const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class FuSuiTemple extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Any,
            condition: context => context.game.isDuringConflict('political'),
            match: card => card.isParticipating(),
            effect: AbilityDsl.effects.addKeyword('pride')
        });
    }
}

FuSuiTemple.id = 'fu-sui-temple';

module.exports = FuSuiTemple;
