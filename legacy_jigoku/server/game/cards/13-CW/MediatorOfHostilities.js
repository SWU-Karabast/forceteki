const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class MediatorOfHostilities extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            limit: AbilityDsl.limit.perRound(2),
            when: {
                onConflictPass: () => true
            },
            gameAction: AbilityDsl.actions.draw()
        });
    }
}

MediatorOfHostilities.id = 'mediator-of-hostilities';

module.exports = MediatorOfHostilities;
