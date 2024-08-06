import { ConflictTypes, CardTypes, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type { Conflict } from '../../../conflict';
import DrawCard from '../../../drawcard';

function areAllAttackersBerserker(conflict: Conflict) {
    return conflict.attackers.every((c) => c.hasTrait('berserker'));
}

export default class WarCry extends DrawCard {
    static id = 'war-cry';

    setupCardAbilities() {
        this.reaction({
            title: 'Break the attacked province',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.player &&
                    event.conflict.attackingPlayer === context.player &&
                    event.conflict.conflictType === ConflictTypes.Military &&
                    !(context.game.currentConflict as Conflict).isAtStrongholdProvince() &&
                    areAllAttackersBerserker(event.conflict)
            },
            effect: 'break an attacked province',
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isConflictProvince() && card.location !== Locations.StrongholdProvince,
                message: '{0} breaks {1}',
                messageArgs: (cards) => [context.player, cards],
                gameAction: AbilityDsl.actions.breakProvince()
            }))
        });
    }
}
