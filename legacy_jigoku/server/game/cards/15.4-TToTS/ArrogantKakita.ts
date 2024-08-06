import { DuelTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class ArrogantKakita extends DrawCard {
    static id = 'arrogant-kakita';

    setupCardAbilities() {
        this.forcedReaction({
            title: 'Initiate a political duel',
            when: {
                onDefendersDeclared: (event, context) => context.source.isParticipating()
            },
            initiateDuel: {
                type: DuelTypes.Military,
                gameAction: (duel) =>
                    AbilityDsl.actions.sendHome((context) => ({
                        target: duel.loser?.includes(context.source) ? context.source : []
                    }))
            },
            limit: AbilityDsl.limit.perRound(Infinity)
        });
    }
}
