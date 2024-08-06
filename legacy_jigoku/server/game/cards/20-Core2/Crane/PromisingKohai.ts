import { Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class PromisingKohai extends DrawCard {
    static id = 'promising-kohai';

    setupCardAbilities() {
        this.duelChallenge({
            title: 'Add +2 to your duel total',
            duelCondition: (duel, context) =>
                duel.participants.some((a) => a.controller === context.source.controller && a !== context.source),
            gameAction: AbilityDsl.actions.duelLastingEffect((context) => ({
                target: (context as any).event.duel,
                effect: AbilityDsl.effects.modifyDuelSkill({ amount: 2, player: context.player }),
                duration: Durations.UntilEndOfDuel
            })),
            effect: 'add 2 to their duel total'
        });
    }
}
