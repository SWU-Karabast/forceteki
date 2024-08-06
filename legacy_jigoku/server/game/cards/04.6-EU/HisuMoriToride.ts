import { CardTypes, Durations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class HisuMoriToride extends StrongholdCard {
    static id = 'hisu-mori-toride-unicorn';

    setupCardAbilities() {
        this.reaction({
            title: 'Gain additional military conflict',
            effect: 'allow {1} to declare an additional military conflict this phase',
            effectArgs: (context) => [context.player],
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.player &&
                    event.conflict.conflictType === 'military' &&
                    context.game.currentConflict.hasMoreParticipants(context.player)
            },
            cost: [
                AbilityDsl.costs.bowSelf(),
                AbilityDsl.costs.sacrifice({
                    cardType: CardTypes.Character,
                    cardCondition: (card) => card.hasTrait('cavalry')
                })
            ],
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                targetController: context.player,
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.additionalConflict('military')
            }))
        });
    }
}
