const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');


class MilitantFaithful extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.player.opponent && context.player.opponent.anyCardsInPlay(card => card.isParticipating() && !card.isOrdinary()),
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}

MilitantFaithful.id = 'militant-faithful';

module.exports = MilitantFaithful;
