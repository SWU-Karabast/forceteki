import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Phases, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class OutmaneuveredByForce extends DrawCard {
    static id = 'outmaneuvered-by-force';

    public setupCardAbilities() {
        this.action({
            title: 'Declare a conflict right now',
            phase: Phases.Conflict,
            condition: (context) =>
                context.game.getConflicts(Players.Any).filter((conflict) => conflict.declared).length === 0,

            gameAction: AbilityDsl.actions.initiateConflict({ canPass: false })
        });
    }

    public canPlay(context: AbilityContext, playType: string): boolean {
        return (
            !context.game.isDuringConflict() &&
            this.controlsBerserkerOrBigCharacter(context) &&
            super.canPlay(context, playType)
        );
    }

    private controlsBerserkerOrBigCharacter(context: AbilityContext): boolean {
        return context.player.cardsInPlay.any(
            (card: DrawCard) =>
                card.getType() === CardTypes.Character && (card.hasTrait('berserker') || card.printedMilitarySkill >= 5)
        );
    }
}
