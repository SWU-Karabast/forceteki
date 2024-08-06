import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, ConflictTypes, Durations } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class MarvelousBeings extends DrawCard {
    static id = 'marvelous-beings';

    public setupCardAbilities() {
        this.action({
            title: 'Move character to conflict and gain skill bonus',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Political),
            cost: AbilityDsl.costs.moveToConflict({
                cardCondition: (card: DrawCard) =>
                    card.type === CardTypes.Character && (card.hasTrait('spirit') || card.hasTrait('creature'))
            }),
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                target: context.player,
                duration: Durations.UntilEndOfConflict,
                effect: AbilityDsl.effects.changePlayerSkillModifier(this.marvelousSkillBonus(context))
            })),
            effect: 'entrance the court, giving their side an extra {1}{2} this conflict',
            effectArgs: (context) => [this.marvelousSkillBonus(context), 'political'],
            max: AbilityDsl.limit.perConflict(1)
        });
    }

    private marvelousSkillBonus(context: AbilityContext): number {
        if (!context.costs.moveToConflict) {
            return 0;
        }
        const bonus = Math.min(context.costs.moveToConflict.printedCost, 3);
        return isNaN(bonus) ? 0 : bonus;
    }
}
