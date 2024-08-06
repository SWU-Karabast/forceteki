import { Phases, TargetModes, Players, CardTypes, Durations } from '../../../Constants';
import AbilityDsl = require('../../../abilitydsl');
import DrawCard = require('../../../drawcard');

export default class IkomaMasterHunter extends DrawCard {
    static id = 'ikoma-master-hunter';

    public setupCardAbilities() {
        this.reaction({
            title: 'move in and ready when target joins',
            when: {
                onPhaseStarted: (event) => event.phase === Phases.Conflict
            },
            target: {
                mode: TargetModes.Single,
                controller: Players.Opponent,
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    duration: Durations.UntilEndOfPhase,
                    target: context.source,
                    effect: AbilityDsl.effects.delayedEffect({
                        when: {
                            onMoveToConflict: (event: any) => event.card === context.target,
                            onDefendersDeclared: (event: any) =>
                                event.conflict.getParticipants().includes(context.target),
                            onConflictDeclared: (event: any) =>
                                event.conflict.getParticipants().includes(context.target)
                        },
                        multipleTrigger: true,
                        gameAction: AbilityDsl.actions.multiple([
                            AbilityDsl.actions.moveToConflict({
                                target: context.source
                            }),
                            AbilityDsl.actions.ready({
                                target: context.source
                            })
                        ])
                    })
                }))
            },
            effect: 'track {0}'
        });
    }
}
