const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Players } = require('../../Constants');

class KuniSilencer extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Take a ring from opponent\'s claimed pool',
            when: {
                afterConflict: (event, context) => context.player.opponent && event.conflict.winner === context.source.controller && context.source.isDefending()
            },
            gameAction: AbilityDsl.actions.selectRing(context => ({
                activePromptTitle: 'Choose a ring to return',
                player: Players.Opponent,
                ringCondition: ring => context.player.opponent && ring.claimedBy === context.player.opponent.name,
                message: '{0} returns {1}',
                messageArgs: ring => [context.player.opponent, ring],
                gameAction: AbilityDsl.actions.returnRing()
            }))
        });
    }
}

KuniSilencer.id = 'kuni-silencer';

module.exports = KuniSilencer;
