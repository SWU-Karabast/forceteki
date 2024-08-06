import { Locations, Durations, Phases } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class MirumotoHitori extends DrawCard {
    static id = 'mirumoto-hitori';

    public setupCardAbilities() {
        this.interrupt({
            title: 'A new incarnation awaits',
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card === context.source && context.game.currentPhase === Phases.Fate
            },
            gameAction: AbilityDsl.actions.cancel((context) => ({
                target: context.source,
                replacementGameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.removeFromGame(),
                    AbilityDsl.actions.cardLastingEffect({
                        target: context.source,
                        canChangeZoneOnce: true,
                        duration: Durations.Custom,
                        until: {
                            onCharacterEntersPlay: (event) => event.card === context.source,
                            onPhaseEnded: (event) => event.phase === Phases.Dynasty
                        },
                        effect: AbilityDsl.effects.delayedEffect({
                            when: {
                                onPhaseStarted: (event) => event.phase === Phases.Dynasty
                            },
                            message: "{0} is put into play due to {0}'s effect",
                            messageArgs: [context.source],
                            gameAction: AbilityDsl.actions.putIntoPlay((context) => ({
                                location: Locations.Any,
                                target: context.source
                            }))
                        })
                    })
                ])
            })),
            effect: 'remove {1} from play, to be put back into play next round',
            effectArgs: (context) => context.source
        });
    }
}
