const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ShepherdOfVisages extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a participating character -2 glory',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: AbilityDsl.effects.modifyGlory(-2)
                }))
            },
            effect: 'give {0} -2 glory until the end of the conflict'
        });
    }
}

ShepherdOfVisages.id = 'shepherd-of-visages';
module.exports = ShepherdOfVisages;
