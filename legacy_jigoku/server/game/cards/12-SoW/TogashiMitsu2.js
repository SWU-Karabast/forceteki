const DrawCard = require('../../drawcard.js');
const { Players, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');
const { RingEffects } = require('../../RingEffects.js');

class TogashiMitsu2 extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'applyCovert',
                restricts: 'opponentsCardEffects'
            })
        });

        this.action({
            title: 'Resolve a ring effect',
            condition: context => context.source.isParticipating() && this.game.currentConflict.getNumberOfCardsPlayed(context.player) >= 5,
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring effect to resolve',
                player: Players.Self,
                ringCondition: (ring, context) => RingEffects.contextFor(context.player, ring.element, false).ability.hasLegalTargets(context),
                gameAction: AbilityDsl.actions.resolveRingEffect(context => ({ player: context.player }))
            },
            effect: 'resolve the {0}\'s effect'
        });
    }
}

TogashiMitsu2.id = 'togashi-mitsu-2';

module.exports = TogashiMitsu2;
