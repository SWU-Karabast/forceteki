import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import type { CostReducer, CostReducerProps } from '../core/cost/CostReducer';
import type Player from '../core/Player';
import { EffectBuilder } from '../core/effect/EffectBuilder';

// TODO: rename "ReduceCost" everywhere to "ModifyCost"
export function modifyCost(properties: CostReducerProps) {
    return EffectBuilder.player.detached(EffectName.CostReducer, {
        apply: (player: Player, context: AbilityContext) => player.addCostReducer(context.source, properties),
        unapply: (player: Player, context: AbilityContext, reducer: CostReducer) => player.removeCostReducer(reducer)
    });
}