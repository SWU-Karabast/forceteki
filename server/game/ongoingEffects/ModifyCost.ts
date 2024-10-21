import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import type { CostAdjuster, ICostAdjusterProperties } from '../core/cost/CostAdjuster';
import type Player from '../core/Player';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';

export function modifyCost(properties: ICostAdjusterProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => player.addCostAdjuster(context.source, withClonedLimit(properties)),
        unapply: (player: Player, context: AbilityContext, adjuster: CostAdjuster) => player.removeCostAdjuster(adjuster)
    });
}

// since the properties object of modifyCost is generated once and then captured, need to copy the limit every
// time the properties are used so that each instance of the cost adjuster has a unique limit
function withClonedLimit(properties: ICostAdjusterProperties) {
    const clonedLimit = properties.limit?.clone();
    return Object.assign(properties, { limit: clonedLimit });
}