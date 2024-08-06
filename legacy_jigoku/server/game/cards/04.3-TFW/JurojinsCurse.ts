import { Phases, Durations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';
import { FatePhase } from '../../gamesteps/FatePhase';

export default class JurojinsCurse extends DrawCard {
    static id = 'jurojin-s-curse';

    setupCardAbilities() {
        this.forcedInterrupt({
            title: 'Resolve a second fate phase',
            when: {
                onPhaseEnded: (event, context) =>
                    context.source.parent && event.phase === Phases.Fate && !context.source.parent.bowed
            },
            effect: 'resolve a second fate phase after this',
            gameAction: AbilityDsl.actions.playerLastingEffect({
                duration: Durations.UntilEndOfRound,
                effect: AbilityDsl.effects.playerDelayedEffect({
                    when: {
                        onPhaseEnded: (event) => event.phase === Phases.Fate
                    },
                    message: '{0} takes hold!',
                    messageArgs: (context) => [context.source],
                    gameAction: AbilityDsl.actions.handler({
                        handler: (context) => context.game.queueStep(new FatePhase(context.game))
                    })
                })
            }),
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
