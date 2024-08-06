const DrawCard = require('../../drawcard.js');
const { Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class GarantoGuardian extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Resolve a ring effect',
            when: {
                afterConflict: (event, context) => context.player.isDefendingPlayer() && event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            gameAction: AbilityDsl.actions.selectRing(context => ({
                activePromptTitle: 'Choose a ring effect to resolve',
                player: Players.Self,
                targets: true,
                message: '{0} chooses to resolve {1}\'s effect',
                ringCondition: ring => this.game.currentConflict.getConflictProvinces().some(a => a.element.includes(ring.element)),
                messageArgs: ring => [context.player, ring],
                gameAction: AbilityDsl.actions.resolveRingEffect({ player: context.player })
            })),
            effect: 'resolve a ring effect'
        });
    }
}

GarantoGuardian.id = 'garanto-guardian';

module.exports = GarantoGuardian;

