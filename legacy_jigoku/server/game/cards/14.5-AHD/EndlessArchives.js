const DrawCard = require('../../drawcard');
const AbilityDsl = require('../../abilitydsl');
const { TokenTypes } = require('../../Constants');

class EndlessArchives extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Place an honor token and draw cards',
            when: {
                onConflictPass: (event, context) => event.conflict.attackingPlayer === context.player
            },
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            anyPlayer: true,
            gameAction: AbilityDsl.actions.addToken(),
            then: () => ({
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.chosenReturnToDeck(context => ({
                        target: context.player,
                        targets: false,
                        shuffle: false,
                        bottom: true,
                        amount: context.source.getTokenCount(TokenTypes.Honor)
                    })),
                    AbilityDsl.actions.draw(context => ({
                        target: context.player,
                        amount: context.events.find(a => a.name === 'onCardMoved') ? context.events.find(a => a.name === 'onCardMoved').cards.length : 0
                    }))
                ])
            }),
            effect: 'place an honor token on {1} and exchange cards from their hand',
            effectArgs: context => [context.source]

        });
    }
}

EndlessArchives.id = 'endless-archives';

module.exports = EndlessArchives;
