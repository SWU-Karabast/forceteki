const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class WatchtowerOfValor extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            when: {
                afterConflict: (event, context) => {
                    if(context.player.isDefendingPlayer() && event.conflict.winner === context.player) {
                        let cards = event.conflict.getConflictProvinces().map(a => context.player.getDynastyCardsInProvince(a.location));
                        return cards.some(c => c.some(card => card.isFaceup() && card.type === CardTypes.Holding && card.hasTrait('kaiu-wall')));
                    }
                    return false;
                }

            },
            gameAction: AbilityDsl.actions.draw(),
            limit: AbilityDsl.limit.unlimitedPerConflict()
        });
    }
}

WatchtowerOfValor.id = 'watchtower-of-valor';

module.exports = WatchtowerOfValor;
