import { ConflictTypes, DuelTypes, Durations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KakitaYuri extends DrawCard {
    static id = 'kakita-yuri';

    setupCardAbilities() {
        this.action({
            title: 'Political duel to stop military conflicts',
            initiateDuel: {
                type: DuelTypes.Political,
                opponentChoosesDuelTarget: true,
                message: 'prevent {0} from declaring military conflicts this phase',
                messageArgs: (duel) => [duel.loserController ?? 'no one'],
                gameAction: (duel) =>
                    AbilityDsl.actions.playerLastingEffect(() => ({
                        targetController: duel.loserController,
                        duration: Durations.UntilEndOfPhase,
                        effect: duel.loser
                            ? AbilityDsl.effects.cannotDeclareConflictsOfType(ConflictTypes.Military)
                            : []
                    }))
            }
        });
    }
}
