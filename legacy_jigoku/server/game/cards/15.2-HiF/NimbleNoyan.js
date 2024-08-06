const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants');

class NimbleNoyan extends DrawCard {
    setupCardAbilities() {
        this.dire({
            condition: context => context.source.isParticipating(),
            targetController: Players.Any,
            match: card => card.type === CardTypes.Character && card.isParticipating(),
            effect: AbilityDsl.effects.canContributeWhileBowed()
        });
    }
}

NimbleNoyan.id = 'nimble-noyan';

module.exports = NimbleNoyan;
