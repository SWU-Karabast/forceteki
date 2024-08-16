import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import type { CostAdjuster, CostAdjusterProperties } from '../core/cost/CostAdjuster';
import type Player from '../core/Player';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';

export function modifyCost(properties: CostAdjusterProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => player.addCostAdjuster(context.source, properties),
        unapply: (player: Player, context: AbilityContext, adjuster: CostAdjuster) => player.removeCostAdjuster(adjuster)
    });
}
