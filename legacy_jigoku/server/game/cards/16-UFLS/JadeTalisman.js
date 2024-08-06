const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class JadeTalisman extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.wouldInterrupt({
            title: 'Cancel a ring effect',
            when: {
                onMoveFate: (event, context) => event.context.source.type === 'ring' && event.origin === context.source.parent && event.fate > 0,
                onCardHonored: (event, context) => event.card === context.source.parent && event.context.source.type === 'ring',
                onCardDishonored: (event, context) => event.card === context.source.parent && event.context.source.type === 'ring',
                onCardBowed: (event, context) => event.card === context.source.parent && event.context.source.type === 'ring',
                onCardReadied: (event, context) => event.card === context.source.parent && event.context.source.type === 'ring'
            },
            cost: AbilityDsl.costs.sacrificeSelf(),
            gameAction: AbilityDsl.actions.cancel(),
            effect: 'cancel the effects of the {1}',
            effectArgs: context => [context.event.context.source]
        });
    }
}

JadeTalisman.id = 'jade-talisman';

module.exports = JadeTalisman;
