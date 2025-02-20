import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import type { ICostAdjusterProperties } from '../core/cost/CostAdjuster';
import { CostAdjuster } from '../core/cost/CostAdjuster';
import type Player from '../core/Player';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import type { IExploitCostAdjusterProperties } from '../abilities/keyword/ExploitCostAdjuster';
import { ExploitCostAdjuster } from '../abilities/keyword/ExploitCostAdjuster';
import * as Contract from '../core/utils/Contract';

export function modifyCost(properties: ICostAdjusterProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => {
            // since the properties object of modifyCost is generated once and then captured, need to copy the limit every
            // time the properties are used so that each instance of the cost adjuster has a unique limit
            const propertiesWithClonedLimit = Object.assign(properties, { limit: properties.limit?.clone() });
            const adjuster = new CostAdjuster(context.game, context.source, propertiesWithClonedLimit);

            player.addCostAdjuster(adjuster);
            return adjuster;
        },
        unapply: (player: Player, context: AbilityContext, adjuster: CostAdjuster) => player.removeCostAdjuster(adjuster)
    });
}

export function addExploit(properties: IExploitCostAdjusterProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => {
            Contract.assertTrue(context.source.hasCost());
            const adjuster = new ExploitCostAdjuster(context.game, context.source, properties);
            player.addCostAdjuster(adjuster);
            return adjuster;
        },
        unapply: (player: Player, context: AbilityContext, adjuster: CostAdjuster) => player.removeCostAdjuster(adjuster)
    });
}
