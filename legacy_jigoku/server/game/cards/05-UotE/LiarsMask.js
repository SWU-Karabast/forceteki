const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class LiarsMask extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard status token from attached character',
            condition: context => !!context.source.parent,
            gameAction: AbilityDsl.actions.selectToken(context => ({
                card: context.source.parent,
                activePromptTitle: 'Which token do you wish to discard?',
                message: '{0} discards {1}',
                messageArgs: (token, player) => [player, token],
                gameAction: AbilityDsl.actions.discardStatusToken()
            })),
            effect: 'discard a status token from {1}',
            effectArgs: context => [context.source.parent]
        });
    }

    canPlay(context, playType) {
        if(context.player.honor > 6) {
            return false;
        }

        return super.canPlay(context, playType);
    }
}

LiarsMask.id = 'liar-s-mask';

module.exports = LiarsMask;
