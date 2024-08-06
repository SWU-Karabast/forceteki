import AbilityDsl from '../../../abilitydsl';
import { CardTypes, ConflictTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class BrokenBlades extends DrawCard {
    static id = 'broken-blades';

    public setupCardAbilities() {
        this.reaction({
            title: 'Return all fate from a character then discard them',
            effect: 'ensure {0} is gone!{1}{2}{3}',
            effectArgs: (context) =>
                context.target.fate < 1
                    ? []
                    : [' (', context.target.owner, ' recovers ' + context.target.fate + ' fate)'],
            when: {
                afterConflict: (event, context) =>
                    context.player.isAttackingPlayer() &&
                    event.conflict.winner === context.player &&
                    event.conflict.conflictType === ConflictTypes.Military
            },

            cost: AbilityDsl.costs.sacrifice({
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && card.hasTrait('berserker')
            }),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.removeFate((context) => ({
                        amount: context.target.getFate(),
                        recipient: context.target.owner
                    })),
                    AbilityDsl.actions.discardFromPlay()
                ])
            },
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}