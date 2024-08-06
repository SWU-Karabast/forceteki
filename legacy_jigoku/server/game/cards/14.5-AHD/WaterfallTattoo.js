const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class WaterfallTattoo extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true
        });

        this.whileAttached({
            effect: AbilityDsl.effects.addTrait('tattooed')
        });

        this.reaction({
            title: 'Ready attached character',
            when: {
                onCardRevealed: (event, context) => context.source.parent && event.card.isProvince && event.card.controller === context.source.parent.controller
            },
            gameAction: AbilityDsl.actions.ready(context => ({ target: context.source.parent }))
        });
    }
}

WaterfallTattoo.id = 'waterfall-tattoo';

module.exports = WaterfallTattoo;
