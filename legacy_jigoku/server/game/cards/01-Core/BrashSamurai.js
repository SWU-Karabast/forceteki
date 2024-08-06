const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class BrashSamurai extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor this character',
            condition: context =>
                context.source.isParticipatingFor(context.player) &&
                this.game.currentConflict.getNumberOfParticipantsFor(context.player) === 1,
            gameAction: AbilityDsl.actions.honor()
        });
    }
}

BrashSamurai.id = 'brash-samurai';

module.exports = BrashSamurai;
