const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');

class DojiAspirant extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Honor this character',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.honor()
        });
    }
}

DojiAspirant.id = 'doji-aspirant';

module.exports = DojiAspirant;
