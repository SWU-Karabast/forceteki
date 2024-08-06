import { CardTypes, Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';
import type Player from '../../../player';

export default class FeignedWeakness extends DrawCard {
    static id = 'feigned-weakness';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    event.card.type === CardTypes.Event &&
                    context.game.isDuringConflict() &&
                    this.#hasEqualOrLessSkill(this.game.currentConflict, context.player)
            },
            cost: AbilityDsl.costs.discardCard({
                location: Locations.Hand,
                cardCondition: (card, context) => card !== context.source
            }),
            gameAction: AbilityDsl.actions.cancel()
        });
    }

    #hasEqualOrLessSkill(conflict: Conflict, player: Player): boolean {
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

        return mySide <= enemySide;
    }
}
