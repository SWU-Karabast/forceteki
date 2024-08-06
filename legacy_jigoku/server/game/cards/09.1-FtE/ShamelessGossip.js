const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players, CardTypes } = require('../../Constants');

class ShamelessGossip extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a status token',
            condition: context => context.source.isParticipating(),
            targets: {
                first: {
                    activePromptTitle: 'Choose a Character to move a status token from',
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: card => card.isHonored || card.isDishonored || card.isTainted
                },
                second: {
                    activePromptTitle: 'Choose a Character to move the status token to',
                    dependsOn: 'first',
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) =>
                        card.controller === context.targets.first.controller &&
                        card !== context.targets.first,
                    gameAction: AbilityDsl.actions.selectToken(context => ({
                        card: context.targets.first,
                        activePromptTitle: 'Which token do you wish to move?',
                        message: '{0} chooses to move {1}',
                        messageArgs: (token, player) => [player, token],
                        gameAction: AbilityDsl.actions.moveStatusToken(context => ({
                            recipient: context.targets.second
                        }))
                    }))
                }
            },
            effect: 'move a status token from {1} to {2}',
            effectArgs: context => [context.targets.first, context.targets.second]
        });
    }
}

ShamelessGossip.id = 'shameless-gossip';

module.exports = ShamelessGossip;

