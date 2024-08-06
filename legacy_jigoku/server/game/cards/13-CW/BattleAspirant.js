const DrawCard = require('../../drawcard.js');
const { Durations, CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class BattleAspirant extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Force a character to defend',
            when: {
                onConflictDeclared: (event, context) => event.attackers.includes(context.source) && this.game.currentConflict.conflictType === 'military'
            },
            target: {
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                cardCondition: card => !card.hasKeyword('covert'),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    duration: Durations.UntilEndOfConflict,
                    effect: AbilityDsl.effects.mustBeDeclaredAsDefender()
                })
            },
            effect: 'force {0} to declare as a defender this conflict'
        });
    }
}

BattleAspirant.id = 'battle-aspirant';

module.exports = BattleAspirant;
