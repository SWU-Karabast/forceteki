const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class KansenHaunt extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Resolve ring effect',
            when: {
                onClaimRing: (event, context) =>
                    context.player.opponent &&
                    context.player.isLessHonorable() &&
                    context.player.isDefendingPlayer() &&
                    event.player === context.player
            },
            cost: AbilityDsl.costs.payHonor(2),
            gameAction: AbilityDsl.actions.resolveRingEffect((context) => ({
                player: context.player,
                // @ts-ignore
                target: context.event.ring
            }))
        });
    }
}

KansenHaunt.id = 'kansen-haunt';

module.exports = KansenHaunt;
