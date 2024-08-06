const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class Defiance extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a character a skill bonus',
            condition: context => context.game.isDuringConflict() && context.player.opponent &&
                context.player.hand.size() < context.player.opponent.hand.size(),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    effect: AbilityDsl.effects.modifyBothSkills(context.player.opponent.showBid)
                }))
            },
            effect: 'give {0} +{1}{2}/+{1}{3}',
            effectArgs: context => [context.player.opponent.showBid, 'military', 'political']
        });
    }
}

Defiance.id = 'defiance';

module.exports = Defiance;
