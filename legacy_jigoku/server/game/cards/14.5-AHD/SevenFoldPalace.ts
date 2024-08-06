import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class SevenFoldPalace extends StrongholdCard {
    static id = 'seven-fold-palace';

    setupCardAbilities() {
        this.reaction({
            title: 'Gain 2 Honor',
            cost: AbilityDsl.costs.bowSelf(),
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.player &&
                    context.player.isAttackingPlayer() &&
                    event.conflict.getAttackers().some((card) => card.isHonored)
            },
            gameAction: AbilityDsl.actions.gainHonor(() => ({ amount: 2 }))
        });
    }
}
