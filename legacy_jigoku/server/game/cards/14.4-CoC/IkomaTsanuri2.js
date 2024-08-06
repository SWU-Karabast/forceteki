const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class IkomaTsanuri2 extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.source.isParticipating(),
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'triggerAbilities',
                restricts: 'attackedProvinceNonForced'
            })
        });
    }
}

IkomaTsanuri2.id = 'ikoma-tsanuri-2';

module.exports = IkomaTsanuri2;
