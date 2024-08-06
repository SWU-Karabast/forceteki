const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants.js');
const DrawCard = require('../../drawcard.js');

class ReserveTents extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Move a character to the conflict',
            limit: AbilityDsl.limit.perRound(2),
            condition: context => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                player: Players.Self,
                gameAction: AbilityDsl.actions.moveToConflict()
            }
        });
    }
}

ReserveTents.id = 'reserve-tents';

module.exports = ReserveTents;
