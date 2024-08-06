const DrawCard = require('../../../drawcard.js');
const { Players, CardTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class RamshackleFacade extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: context => context.game.isDuringConflict(),
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Holding
            }),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: card => card.isAttacking() && card.costLessThan(4),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}

RamshackleFacade.id = 'ramshackle-facade';

module.exports = RamshackleFacade;
