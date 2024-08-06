import { ConflictTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';
import type Player from '../../../player';

function hasEqualOrHigherSkill(conflict: Conflict, player: Player): boolean {
    let mySide = 0;
    let enemySide = 0;
    const conflictType = conflict.conflictType;
    for (const attackingChar of conflict.attackers) {
        if (conflict.defendingPlayer === player) {
            enemySide += attackingChar.getSkill(conflictType);
        } else {
            mySide += attackingChar.getSkill(conflictType);
        }
    }

    for (const defendingChar of conflict.defenders) {
        if (conflict.defendingPlayer === player) {
            mySide += defendingChar.getSkill(conflictType);
        } else {
            enemySide += defendingChar.getSkill(conflictType);
        }
    }

    return mySide >= enemySide;
}

export default class DiplomatOfTheSteppes extends DrawCard {
    static id = 'diplomat-of-the-steppes';

    setupCardAbilities() {
        this.action({
            title: 'Change the conflict to military',
            cost: AbilityDsl.costs.payHonor(1),
            condition: (context) =>
                (context.source as DrawCard).isParticipating('political') &&
                hasEqualOrHigherSkill(context.game.currentConflict, context.player),
            effect: 'switch the conflict type to {1}',
            effectArgs: () => 'military',
            gameAction: AbilityDsl.actions.switchConflictType({ targetConflictType: ConflictTypes.Military })
        });
    }
}
