const DrawCard = require('../../drawcard.js');
const { Players, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ContestedCountryside extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            match: card => card.isConflictProvince(),
            targetLocation: Locations.Provinces,
            condition: context => context.player.isAttackingPlayer(),
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.canBeTriggeredByOpponent()
        });
    }
}

ContestedCountryside.id = 'contested-countryside';

module.exports = ContestedCountryside;
