const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes } = require('../../Constants');

class AcclaimedGeishaHouse extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Switch the contested ring',
            condition: context => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.dishonor({ cardCondition: card => card.isParticipating() }),
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose an unclaimed ring',
                ringCondition: ring => ring.isUnclaimed(),
                gameAction: AbilityDsl.actions.switchConflictElement()
            },
            effect: 'switch the contested ring with the {0}'
        });
    }
}

AcclaimedGeishaHouse.id = 'acclaimed-geisha-house';

module.exports = AcclaimedGeishaHouse;
