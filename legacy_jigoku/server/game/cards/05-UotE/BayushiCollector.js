const DrawCard = require('../../drawcard.js');
const { CardTypes, CharacterStatus } = require('../../Constants');

class BayushiCollector extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Discard an attachment and a status token',
            target: {
                cardType: CardTypes.Attachment,
                cardCondition: card => card.parent && card.parent.type === CardTypes.Character && card.parent.isDishonored,
                gameAction: [ability.actions.discardFromPlay(),
                    ability.actions.discardStatusToken(context => ({
                        target: context.target.parent.getStatusToken(CharacterStatus.Dishonored)
                    }))
                ]
            }
        });
    }
}

BayushiCollector.id = 'bayushi-collector';

module.exports = BayushiCollector;
