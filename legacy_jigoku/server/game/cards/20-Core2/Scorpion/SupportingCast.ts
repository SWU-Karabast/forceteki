import { CardTypes, Durations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type BaseCard from '../../../basecard';

export default class SupportingCast extends DrawCard {
    static id = 'supporting-cast';

    setupCardAbilities() {
        this.interrupt({
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    context.game.isDuringConflict() &&
                    event.cardTargets.some((card: BaseCard) => card.controller === context.player)
            },
            title: 'Give +3 military to a character',
            cost: AbilityDsl.costs.bow({
                cardType: CardTypes.Character,
                cardCondition: (card, context) =>
                    (context as any).event.cardTargets.includes(
                        (targetedByAbility: BaseCard) => targetedByAbility === card
                    )
            }),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card: DrawCard) => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    duration: Durations.UntilEndOfConflict,
                    effect: AbilityDsl.effects.modifyMilitarySkill(3)
                })
            },
            max: AbilityDsl.limit.perConflict(1)
        });
    }
}
