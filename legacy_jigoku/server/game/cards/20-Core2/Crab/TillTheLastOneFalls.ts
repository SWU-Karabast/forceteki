import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type { Conflict } from '../../../conflict';
import DrawCard from '../../../drawcard';

export default class TillTheLastOneFalls extends DrawCard {
    static id = 'till-the-last-one-falls-';

    public setupCardAbilities() {
        this.action({
            title: 'Give a character a skill bonus',
            condition: (context) =>
                context.game.isDuringConflict() &&
                context.player.opponent &&
                context.game.currentConflict.hasMoreParticipants(context.player.opponent),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: AbilityDsl.effects.modifyBothSkills(this.#bonus(context))
                }))
            },
            effect: 'give {0} +{1}{2}/+{1}{3}',
            effectArgs: (context) => [this.#bonus(context), 'military', 'political']
        });
    }

    #bonus(context: AbilityContext): number {
        const conflict = context.game.currentConflict as Conflict;
        const opponentCount = conflict.getNumberOfParticipantsFor(context.player.opponent);
        const playerCount = conflict.getNumberOfParticipantsFor(context.player);
        return Math.max(0, 2 * (opponentCount - playerCount));
    }
}
