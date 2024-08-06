const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class DaidojiIronWarrior extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Force each player to discard to 4 cards',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.chosenDiscard(context => ({
                    target: context.player.opponent,
                    amount: Math.max(0, context.player.opponent.hand.size() - 4)
                })),
                AbilityDsl.actions.chosenDiscard(context => ({
                    target: context.player,
                    amount: Math.max(0, context.player.hand.size() - 4)
                }))
            ]),
            effect: 'make both players discard down to 4 cards'
        });
    }
}

DaidojiIronWarrior.id = 'daidoji-iron-warrior';

module.exports = DaidojiIronWarrior;
