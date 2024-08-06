const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants.js');

class UnveiledCorruption extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Force opponent to discard cards to match your hand size',
            cost: AbilityDsl.costs.taint({ cardCondition: card => {
                return card.type === CardTypes.Province && !card.isBroken;
            }}),
            gameAction: AbilityDsl.actions.chosenDiscard(context => ({
                target: context.player.opponent,
                amount: Math.max(0, context.player.opponent.hand.size() - context.player.hand.filter(card => card !== context.source).length)
            }))
        });
    }
}

UnveiledCorruption.id = 'unveiled-corruption';

module.exports = UnveiledCorruption;
