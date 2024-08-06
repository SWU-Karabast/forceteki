const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class PerfectLandEthos extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard each status token',
            effect: 'discard each status token',
            gameAction: AbilityDsl.actions.discardStatusToken(context => ({
                target: context.game.findAnyCardsInAnyList(card => card.hasStatusTokens).map(card => card.statusTokens)
            }))
        });
    }
}

PerfectLandEthos.id = 'perfect-land-ethos';

module.exports = PerfectLandEthos;
