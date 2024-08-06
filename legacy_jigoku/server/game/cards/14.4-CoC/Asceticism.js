const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Locations } = require('../../Constants');

class Asceticism extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            condition: context => context.player.getNumberOfFacedownProvinces(province => province.location !== Locations.StrongholdProvince) > 1,
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsTriggeredAbilities',
                source: this
            })
        });
    }
}

Asceticism.id = 'asceticism';

module.exports = Asceticism;
