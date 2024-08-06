import AbilityDsl from '../../abilitydsl';
import { AbilityTypes } from '../../Constants';
import DrawCard from '../../drawcard';
import { TriggeredAbilityProps } from '../../Interfaces';

export default class SelfUnderstanding extends DrawCard {
    static id = 'self-understanding';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsEvents',
                source: this
            })
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Resolve all claimed ring effects',
                when: {
                    afterConflict: (event, context) =>
                        event.conflict.winner === context.source.controller && context.source.isParticipating()
                },
                condition: (context) => context.player.getClaimedRings().length > 0,
                gameAction: AbilityDsl.actions.resolveRingEffect((context) => ({
                    player: context.player,
                    target: context.player.getClaimedRings()
                })),
                effect: 'resolve all their claimed ring effects'
            } as TriggeredAbilityProps)
        });
    }
}