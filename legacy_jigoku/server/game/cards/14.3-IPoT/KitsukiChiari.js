const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class KitsukiChiari extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Name a card',
            when: {
                onCardRevealed: (event, context) => event.card.isProvince && event.card.controller === context.player &&
                    context.player.opponent && context.player.opponent.hand.size() > 0
            },
            cost: AbilityDsl.costs.nameCard(),
            gameAction: AbilityDsl.actions.multipleContext(context => {
                let cards = context.player.opponent.hand.shuffle().slice(0, 4).sort((a, b) => a.name.localeCompare(b.name));
                return ({
                    gameActions: [
                        AbilityDsl.actions.lookAt(() => ({
                            target: cards.sort(card => card.name)
                        })),
                        AbilityDsl.actions.discardMatching(context => ({
                            target: context.player.opponent,
                            cards: cards.sort((a, b) => a.name.localeCompare(b.name)),
                            amount: -1, //all
                            reveal: false,
                            match: (context, card) => card.name === context.costs.nameCardCost
                        }))
                    ]
                });
            }),
            effect: 'look at 4 random cards in {1}\'s hand and discard all cards named {2}',
            effectArgs: context => [context.player.opponent, context.costs.nameCardCost]
        });
    }

    selectCardName(player, cardName, context) {
        context.costs.kitsukiChiariCost = cardName;
        return true;
    }

    allowAttachment(attachment) {
        if(attachment.hasTrait('poison') && !this.isBlank()) {
            return false;
        }

        return super.allowAttachment(attachment);
    }
}

KitsukiChiari.id = 'kitsuki-chiari';
module.exports = KitsukiChiari;
