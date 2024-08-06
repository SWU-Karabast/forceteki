import AbilityDsl from '../../../abilitydsl';
import BaseCard from '../../../basecard';
import { CardTypes, Durations, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class ToShowThePath extends DrawCard {
    static id = 'to-show-the-path';

    public setupCardAbilities() {
        this.action({
            title: 'Target unit costs more fate to target',
            condition: (context) =>
                (context.player.cardsInPlay as BaseCard[]).some(
                    (card) => card.hasTrait('monk') || card.hasTrait('shugenja')
                ),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                mode: TargetModes.Single,
                cardCondition: (card) => !card.hasTrait('monk') && !card.hasTrait('shugenja'),
                gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                    targetController: context.player.opponent,
                    duration: Durations.UntilEndOfPhase,
                    effect: AbilityDsl.effects.playerFateCostToTargetCard({
                        amount: 1,
                        targetPlayer: context.target.controller === context.player ? Players.Opponent : Players.Self,
                        match: (card: BaseCard) =>
                            card === context.target ||
                            context.target.attachments.some((attachment: BaseCard) => attachment === card)
                    })
                }))
            },
            effect: 'make {1} pay 1 additional fate as a cost whenever they target {0} or its attachments with a card ability until the end of the phase',
            effectArgs: (context) => [context.source.controller.opponent]
        });
    }
}
