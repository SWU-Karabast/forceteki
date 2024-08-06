const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class TeacherOfEmptyThought extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Draw a card',
            condition: context => context.source.isParticipating() && context.game.currentConflict.getNumberOfCardsPlayed(context.player) >= 3,
            gameAction: AbilityDsl.actions.draw()
        });
    }
}

TeacherOfEmptyThought.id = 'teacher-of-empty-thought';

module.exports = TeacherOfEmptyThought;
