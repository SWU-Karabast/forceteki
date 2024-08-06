import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

export default class ArrowsFromTheWoods extends DrawCard {
    static id = 'arrows-from-the-woods';

    public setupCardAbilities() {
        this.action({
            title: "Reduce opponent's characters mil",
            condition: (context) =>
                context.game.isDuringConflict('military') &&
                context.player.anyCardsInPlay((card: BaseCard) => card.isParticipating() && card.hasTrait('bushi')),
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.game.currentConflict.getCharacters(context.player.opponent),
                effect: AbilityDsl.effects.modifyMilitarySkill(this.penaltyValue(context))
            })),
            effect: "give {1}'s participating characters {2}{3}",
            effectArgs: (context) => [context.player.opponent, this.penaltyValue(context), 'military'],
            max: AbilityDsl.limit.perConflict(1)
        });
    }

    private penaltyValue(context: AbilityContext): number {
        const hasScoutOrShinobiParticipating = context.player.anyCardsInPlay(
            (card: BaseCard) => card.isParticipating() && card.hasSomeTrait('scout', 'shinobi')
        );
        return hasScoutOrShinobiParticipating ? -2 : -1;
    }
}
