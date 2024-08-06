const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl');
const { Locations } = require('../../../Constants.js');

class MatsuSakura extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel conflict province ability',
            when: {
                onInitiateAbilityEffects: (event, context) => context.source.isAttacking() && event.card.isConflictProvince() && event.card.controller &&
                    (event.card.controller.getDynastyCardsInProvince(event.card.location).some(a => a.isFaceup()) || //any faceup cards
                        event.card.location === Locations.StrongholdProvince)
            },
            effect: 'cancel the effects of {1}\'s ability',
            effectArgs: context => context.event.card,
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}

MatsuSakura.id = 'matsu-sakura';

module.exports = MatsuSakura;
