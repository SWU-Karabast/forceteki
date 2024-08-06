const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class FurtiveSympathizer extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Switch each character\'s base skills',
            condition: context => context.source.isParticipating() && context.source.isOrdinary(),
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                target: context.game.currentConflict.getParticipants().filter(a => !a.hasDash()),
                effect: AbilityDsl.effects.switchBaseSkills()
            })),
            effect: 'switch all participating character\'s base military and political skill'
        });
    }
}

FurtiveSympathizer.id = 'furtive-sympathizer';

module.exports = FurtiveSympathizer;
