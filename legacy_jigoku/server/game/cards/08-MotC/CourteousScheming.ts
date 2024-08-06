import { DuelTypes, Durations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class CourteousScheming extends DrawCard {
    static id = 'courteous-scheming';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            condition: () => this.game.currentConflict && this.game.currentConflict.conflictType === 'political',
            initiateDuel: () => ({
                type: DuelTypes.Political,
                opponentChoosesDuelTarget: true,
                message: 'allow {0} to declare an additional political conflict this phase',
                messageArgs: (duel) => [duel.winnerController ?? ''],
                gameAction: (duel) =>
                    duel.winner &&
                    AbilityDsl.actions.playerLastingEffect({
                        targetController: duel.winnerController,
                        duration: Durations.UntilEndOfPhase,
                        effect: AbilityDsl.effects.additionalConflict('political')
                    })
            }),
            max: AbilityDsl.limit.perRound(1)
        });
    }
}
