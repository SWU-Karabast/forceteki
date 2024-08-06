import { Players, ConflictTypes, Durations } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class CastleOfTheForgotten extends StrongholdCard {
    static id = 'castle-of-the-forgotten';

    setupCardAbilities() {
        this.reaction({
            title: 'Make all conflicts military',
            cost: AbilityDsl.costs.bowSelf(),
            when: {
                onBreakProvince: (event, context) => event.card.owner !== context.player
            },
            gameAction: AbilityDsl.actions.playerLastingEffect({
                targetController: Players.Any,
                effect: AbilityDsl.effects.setConflictDeclarationType(ConflictTypes.Military),
                duration: Durations.UntilEndOfPhase
            }),
            effect: 'make all future conflicts {1} for this phase',
            effectArgs: ['military']
        });
    }
}
