const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class MasashigisSacrifice extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Defending characters do not bow as a result of conflict resolution',
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: card => card.hasStatusTokens
            }),
            condition: () => this.game.isDuringConflict(),
            gameAction: [
                AbilityDsl.actions.cardLastingEffect(context => ({
                    target: context.game.currentConflict.getDefenders(),
                    effect: AbilityDsl.effects.doesNotBow()
                }))
            ],
            effect: 'prevent defending characters from bowing at the end of a the conflict'
        });
    }
}

MasashigisSacrifice.id = 'masashigi-s-sacrifice';

module.exports = MasashigisSacrifice;
