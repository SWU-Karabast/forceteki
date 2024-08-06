const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class IuchiSoulweaver extends DrawCard {
    setupCardAbilities() {
        this.dire({
            condition: context => context.game.isDuringConflict() && context.game.currentConflict.getNumberOfParticipantsFor(context.player, card => card !== context.source) > 0,
            effect: AbilityDsl.effects.participatesFromHome()
        });

        this.dire({
            condition: context => context.source.isAtHome(),
            effect: AbilityDsl.effects.doesNotBow()
        });
    }
}

IuchiSoulweaver.id = 'iuchi-soulweaver';

module.exports = IuchiSoulweaver;
