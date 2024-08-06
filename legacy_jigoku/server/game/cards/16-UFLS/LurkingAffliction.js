const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class LurkingAffliction extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Taint a participating character',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.taint()
            }
        });
    }
}

LurkingAffliction.id = 'lurking-affliction';

module.exports = LurkingAffliction;
