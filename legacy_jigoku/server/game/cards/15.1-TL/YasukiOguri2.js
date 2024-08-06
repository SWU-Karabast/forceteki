const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class YasukiOguri2 extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a character in',
            condition: context => context.source.isDefending(),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.moveToConflict(),
                cardCondition: card => card.getFate() > 0
            },
            cost: AbilityDsl.costs.payFate(1)
        });
    }
}

YasukiOguri2.id = 'yasuki-oguri-2';

module.exports = YasukiOguri2;
