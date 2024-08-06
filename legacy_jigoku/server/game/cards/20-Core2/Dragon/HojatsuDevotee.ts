import { DuelTypes } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class HojatsuDevotee extends DrawCard {
    static id = 'hojatsu-devotee';

    public setupCardAbilities() {
        this.interrupt({
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card === context.source && event.context.player === context.player.opponent
            },
            title: 'Initiate a military duel, discarding the loser',
            initiateDuel: {
                type: DuelTypes.Military,
                requiresConflict: false,
                gameAction: (duel) => AbilityDsl.actions.discardFromPlay({ target: duel.loser })
            }
        });
    }
}
