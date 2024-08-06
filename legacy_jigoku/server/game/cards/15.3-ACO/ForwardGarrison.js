const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes } = require('../../Constants.js');

class ForwardGarrison extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.game.isTraitInPlay('battlefield'),
            match: (card, context) => card.type === CardTypes.Character && card.controller === context.player,
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'removeFate',
                restricts: 'opponentsCardAndRingEffects'
            })
        });
    }
}

ForwardGarrison.id = 'forward-garrison';

module.exports = ForwardGarrison;
