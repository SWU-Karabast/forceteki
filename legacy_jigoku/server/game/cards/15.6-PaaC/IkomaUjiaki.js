const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class IkomaUjiaki2 extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Switch the conflict type',
            condition: context => context.source.isParticipating(),
            cost: AbilityDsl.costs.payHonor(2),
            effect: 'switch the conflict type',
            gameAction: AbilityDsl.actions.switchConflictType()
        });
    }
}

IkomaUjiaki2.id = 'ikoma-ujiaki-2';

module.exports = IkomaUjiaki2;
