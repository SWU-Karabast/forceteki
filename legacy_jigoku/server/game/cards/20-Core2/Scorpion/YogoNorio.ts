import { CardTypes, Durations, ConflictTypes, Phases } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class YogoNorio extends DrawCard {
    static id = 'yogo-norio';

    setupCardAbilities() {
        this.action({
            title: 'Gain another political conflict',
            effect: 'allow {1} to declare an additional political conflict this phase',
            effectArgs: (context) => [context.player],
            condition: (context) => context.game.currentPhase === Phases.Conflict,
            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character
            }),
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                targetController: context.player,
                duration: Durations.UntilEndOfPhase,
                effect: AbilityDsl.effects.additionalConflict(ConflictTypes.Political)
            }))
        });
    }
}
