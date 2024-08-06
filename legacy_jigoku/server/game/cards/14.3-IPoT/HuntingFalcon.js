const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class HuntingFalcon extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Look at a province',
            when: {
                onCardAttached: (event, context) => event.card === context.source && event.originalLocation !== Locations.PlayArea
            },
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                cardCondition: card => card.isFacedown(),
                gameAction: AbilityDsl.actions.lookAt(context => ({
                    message: '{0} sees {1} in {2}',
                    messageArgs: (cards) => [context.source, cards[0], cards[0].location]
                }))
            }
        });
    }
}

HuntingFalcon.id = 'hunting-falcon';

module.exports = HuntingFalcon;
