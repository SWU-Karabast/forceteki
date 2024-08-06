const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class IuchiShahai2 extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => this.game.getFirstPlayer() === context.player,
            effect: AbilityDsl.effects.addKeyword('covert')
        });

        this.reaction({
            title: 'Place 1 fate on this character',
            cost: AbilityDsl.costs.payHonor(1),
            when: {
                onCardPlayed: (event, context) => (event.card.hasTrait('meishodo') || event.card.hasTrait('maho')) && event.player === context.player
            },
            gameAction: AbilityDsl.actions.placeFate()
        });
    }
}

IuchiShahai2.id = 'iuchi-shahai-2';

module.exports = IuchiShahai2;
