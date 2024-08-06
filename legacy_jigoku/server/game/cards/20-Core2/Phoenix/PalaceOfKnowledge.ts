import type { AbilityContext } from '../../../AbilityContext';
import { TargetModes } from '../../../Constants';
import { StrongholdCard } from '../../../StrongholdCard';
import AbilityDsl from '../../../abilitydsl';
import type Ring from '../../../ring';

export default class PalaceOfKnowledge extends StrongholdCard {
    static id = 'palace-of-knowledge';

    setupCardAbilities() {
        this.reaction({
            title: 'Resolve another ring effect',
            when: {
                onResolveRingElement: (event, context) =>
                    event.player === context.player && event.effectivellyResolvedEffect
            },
            cost: [AbilityDsl.costs.bowSelf(), AbilityDsl.costs.discardCard()],
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring',
                ringCondition: (ring: Ring, context: AbilityContext) =>
                    ring !== (context as any).event.ring && ring.isUnclaimed(),
                gameAction: AbilityDsl.actions.resolveRingEffect()
            }
        });
    }
}