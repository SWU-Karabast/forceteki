const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class FlankTheEnemy extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow a character',
            condition: context => context.player.opponent && context.game.isDuringConflict() && context.game.currentConflict.hasMoreParticipants(context.player),
            target: {
                player: Players.Opponent,
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}

FlankTheEnemy.id = 'flank-the-enemy';

module.exports = FlankTheEnemy;
