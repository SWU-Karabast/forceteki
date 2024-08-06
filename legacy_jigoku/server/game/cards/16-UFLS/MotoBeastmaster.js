const DrawCard = require('../../drawcard.js');
const { Locations, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class MotoBeastmaster extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Put a character into play',
            when: {
                onConflictDeclared: (event, context) => event.attackers.includes(context.source)
            },
            target: {
                cardType: CardTypes.Character,
                location: Locations.Provinces,
                controller: Players.Self,
                cardCondition: (card, context) => context.player.firstPlayer ? card.costLessThan(5) : card.costLessThan(3),
                gameAction: AbilityDsl.actions.putIntoConflict()
            }
        });
    }
}

MotoBeastmaster.id = 'moto-beastmaster';

module.exports = MotoBeastmaster;
