const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');
const { Locations } = require('../../Constants');

class FavorableAlliance extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Draw cards',
            cost: AbilityDsl.costs.variableFateCost({
                minAmount: 1,
                maxAmount: (context) => context.player.conflictDeck.size(),
                activePromptTitle: 'Choose a value for X'
            }),
            effect: 'set aside {1} card{2}',
            effectArgs: (context) => [context.costs.variableFateCost, context.costs.variableFateCost > 1 ? 's' : ''],
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.lookAt((context) => ({
                    target: context.player.conflictDeck.first(context.costs.variableFateCost),
                    message: '{0} sets aside the top {1} card{3} from their conflict deck: {2}',
                    messageArgs: (cards) => [context.player, cards.length, cards, cards.length > 1 ? 's' : '']
                })),
                AbilityDsl.actions.handler({
                    handler: (context) => {
                        let cards = context.player.conflictDeck.first(context.costs.variableFateCost);
                        cards.forEach((card) => {
                            card.owner.removeCardFromPile(card);
                            card.moveTo(Locations.RemovedFromGame);
                            context.player.removedFromGame.unshift(card);
                            context.source.lastingEffect(() => ({
                                until: {
                                    onCardMoved: (event) =>
                                        event.card === card && event.originalLocation === Locations.RemovedFromGame
                                },
                                match: card,
                                effect: [AbilityDsl.effects.canPlayFromOwn(Locations.RemovedFromGame, [card], this)]
                            }));
                        });
                    }
                })
            ])
        });
    }
}

FavorableAlliance.id = 'favorable-alliance';

module.exports = FavorableAlliance;
