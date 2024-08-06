import { ConflictTypes, DuelTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class SteelOnSteel extends DrawCard {
    static id = 'steel-on-steel';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a military duel, discarding the loser',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            initiateDuel: {
                type: DuelTypes.Military,
                gameAction: (duel) =>
                    AbilityDsl.actions.conditional({
                        target: duel.loser?.[0],
                        condition: duel.loser?.[0]?.getFate() > 0,
                        trueGameAction: AbilityDsl.actions.removeFate(),
                        falseGameAction: AbilityDsl.actions.discardFromPlay()
                    })
            }
        });
    }
}
