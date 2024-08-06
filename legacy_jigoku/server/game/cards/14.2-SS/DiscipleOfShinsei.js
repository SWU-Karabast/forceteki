const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class DiscipleOfShinsei extends DrawCard {
    setupCardAbilities() {
        this.interrupt({
            title: 'Discard an attachment',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Attachment,
                gameAction: AbilityDsl.actions.discardFromPlay()
            }
        });
    }
}

DiscipleOfShinsei.id = 'disciple-of-shinsei';

module.exports = DiscipleOfShinsei;


