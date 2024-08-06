const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class Overrun extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Blank and reveal a province',
            when: {
                onBreakProvince: (event, context) => event.card.owner !== context.player
            },
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                controller: Players.Opponent,
                cardCondition: (card, context) => card.controller !== context.player,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.dishonorProvince(),
                    AbilityDsl.actions.reveal({ chatMessage: true })
                ])
            }
        });
    }
}

Overrun.id = 'overrun';

module.exports = Overrun;
