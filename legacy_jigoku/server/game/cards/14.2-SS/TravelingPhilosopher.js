const AbilityDsl = require('../../abilitydsl.js');

const DrawCard = require('../../drawcard.js');
const { CardTypes, Locations, Players } = require('../../Constants');

class TravelingPhilospher extends DrawCard {
    setupCardAbilities() {
        this.interrupt({
            title: 'Flip a province facedown',
            when: {
                onCardLeavesPlay: (event, context) => event.card === context.source
            },
            target: {
                controller: Players.Self,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => !card.isBroken,
                gameAction: AbilityDsl.actions.turnFacedown()
            }
        });
    }
}

TravelingPhilospher.id = 'traveling-philosopher';

module.exports = TravelingPhilospher;
