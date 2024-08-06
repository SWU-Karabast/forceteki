import { DuelTypes, Players } from '../../Constants';
import type { Duel } from '../../Duel';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class KakitaToshimoko extends DrawCard {
    static id = 'kakita-toshimoko';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Initiate a military duel',
            when: {
                afterConflict: (event, context) =>
                    context.source.isParticipating() && event.conflict.loser === context.player
            },
            initiateDuel: {
                type: DuelTypes.Military,
                opponentChoosesDuelTarget: true,
                message: 'both players count 0 total skill for the conflict',
                gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                    targetController: Players.Any,
                    effect:
                        (context.game.currentDuel as Duel).winner?.includes(context.source) ?? false
                            ? AbilityDsl.effects.setConflictTotalSkill(0)
                            : []
                }))
            }
        });
    }
}
