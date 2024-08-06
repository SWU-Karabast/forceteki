const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations } = require('../../Constants');

class CeaselessDuty extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent a character from leaving play',
            when: {
                onCardLeavesPlay: (event, context) => event.card.type === CardTypes.Character && event.card.costLessThan(context.player.getProvinces(a => !a.isBroken).length + 1) && event.card.location === Locations.PlayArea
            },
            effect: 'prevent {1} from leaving play',
            effectArgs: context => context.event.card,
            cannotBeMirrored: true,
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}

CeaselessDuty.id = 'ceaseless-duty';

module.exports = CeaselessDuty;
