const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class CurseOfMisfortune extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: (card, context) => card.parent && card.parent === context.source.parent && card !== context.source,
            targetController: Players.Any,
            effect: AbilityDsl.effects.addKeyword('restricted')
        });
    }
}

CurseOfMisfortune.id = 'curse-of-misfortune';

module.exports = CurseOfMisfortune;
