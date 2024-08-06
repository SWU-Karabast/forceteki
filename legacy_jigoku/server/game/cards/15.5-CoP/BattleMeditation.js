const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class BattleMeditation extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'draw 3 cards',
            when: {
                onBreakProvince: (event, context) => context.game.isDuringConflict() && event.card.owner !== context.player
                    && context.game.currentConflict.getParticipants().some(p => p.controller === context.player && p.hasTrait('berserker'))
            },
            gameAction: AbilityDsl.actions.draw({
                amount: 3
            }),
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}

BattleMeditation.id = 'battle-meditation';

module.exports = BattleMeditation;
