import { CardTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';
import type Player from '../../../player';

/**
 * Returns -1 in case there are no cavalry characters. It is not exactly correct, but it works fine
 */
function participatingCavGlory(conflict: Conflict, player: Player): number {
    return Math.max(
        -1,
        ...conflict
            .getParticipants((card) => card.controller === player && card.hasTrait('cavalry'))
            .map((x) => x.glory)
    );
}

export default class UtakuStableMaster extends DrawCard {
    static id = 'utaku-stable-master';

    setupCardAbilities() {
        this.action({
            title: 'Bow participating character with lower glory than participating cavalry.',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card: DrawCard, context) =>
                    card.isParticipating() &&
                    card.glory <= participatingCavGlory(context.game.currentConflict, context.player),
                gameAction: AbilityDsl.actions.bow()
            }
        });
    }
}
