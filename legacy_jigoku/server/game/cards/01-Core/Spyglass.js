const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class Spyglass extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            when: {
                onConflictDeclared: (event, context) => event.attackers.includes(context.source.parent),
                onDefendersDeclared: (event, context) => event.defenders.includes(context.source.parent),
                onMoveToConflict: (event, context) => event.card === context.source.parent
            },
            gameAction: AbilityDsl.actions.draw(),
            limit: AbilityDsl.limit.perRound(2)
        });
    }
}

Spyglass.id = 'spyglass';

module.exports = Spyglass;
