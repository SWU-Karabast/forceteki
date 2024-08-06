import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class RovingMichibiku extends DrawCard {
    static id = 'roving-michibiku';

    public setupCardAbilities() {
        this.reaction({
            title: "Take a ring from opponent's claimed pool",
            when: {
                afterConflict: (event, context) =>
                    context.source.isAttacking() &&
                    event.conflict.winner === context.source.controller &&
                    context.player.opponent !== undefined
            },
            gameAction: AbilityDsl.actions.selectRing((context) => ({
                activePromptTitle: 'Choose a ring to take',
                ringCondition: (ring) => context.player.opponent && ring.claimedBy === context.player.opponent.name,
                message: '{0} takes {1}',
                messageArgs: (ring) => [context.player, ring],
                gameAction: AbilityDsl.actions.takeRing()
            }))
        });
    }
}
