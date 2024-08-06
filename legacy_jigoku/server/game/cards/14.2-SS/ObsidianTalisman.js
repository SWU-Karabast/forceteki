const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class ObsidianTalisman extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard attached character\'s token',
            limit: AbilityDsl.limit.perRound(Infinity),
            cost: AbilityDsl.costs.payHonor(1),
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
}

ObsidianTalisman.id = 'obsidian-talisman';

module.exports = ObsidianTalisman;


