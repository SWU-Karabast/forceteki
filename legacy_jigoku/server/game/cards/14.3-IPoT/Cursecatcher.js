const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes } = require('../../Constants');

class Cursecatcher extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel province ability',
            when: {
                onInitiateAbilityEffects: event => event.card.type === CardTypes.Province && //province
                    event.card.controller && event.card.controller.getDynastyCardsInProvince(event.card.location).some(a => a.isFacedown()) //any facedown cards
            },
            effect: 'cancel the effects of {1}\'s ability',
            effectArgs: context => context.event.card,
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}

Cursecatcher.id = 'cursecatcher';

module.exports = Cursecatcher;
