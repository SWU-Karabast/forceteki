const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ResourcefulMahoTsukai extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isDishonored,
            effect: AbilityDsl.effects.reduceCost({
                match: card => card.hasTrait('maho')
            })
        });
    }
}

ResourcefulMahoTsukai.id = 'resourceful-maho-tsukai';

module.exports = ResourcefulMahoTsukai;
