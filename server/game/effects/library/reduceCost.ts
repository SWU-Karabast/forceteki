import type { AbilityContext } from '../../AbilityContext';
import { EffectNames } from '../../Constants';
import type { CostReducer, CostReducerProps } from '../../CostReducer';
import type Player from '../../player';
import { EffectBuilder } from '../EffectBuilder';

export function reduceCost(properties: CostReducerProps) {
    return EffectBuilder.player.detached(EffectNames.CostReducer, {
        apply: (player: Player, context: AbilityContext) => player.addCostReducer(context.source, properties),
        unapply: (player: Player, context: AbilityContext, reducer: CostReducer) => player.removeCostReducer(reducer)
    });
}