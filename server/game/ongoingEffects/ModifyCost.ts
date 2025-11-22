import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import type { ICostAdjusterProperties, IExhaustUnitsCostAdjusterProperties, IExploitCostAdjusterProperties } from '../core/cost/CostAdjuster';
import type { CostAdjuster } from '../core/cost/CostAdjuster';
import type { Player } from '../core/Player';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { ExploitCostAdjuster } from '../abilities/keyword/exploit/ExploitCostAdjuster';
import * as Contract from '../core/utils/Contract';
import * as CostAdjusterFactory from '../core/cost/CostAdjusterFactory';
import { ExhaustUnitsCostAdjuster } from '../core/cost/ExhaustUnitsCostAdjuster';

export function modifyCost(properties: ICostAdjusterProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => {
            // since the properties object of modifyCost is generated once and then captured, need to copy the limit every
            // time the properties are used so that each instance of the cost adjuster has a unique limit
            const propertiesWithClonedLimit = Object.assign(properties, { limit: properties.limit?.clone() });
            const adjuster = CostAdjusterFactory.create(context.game, context.source, propertiesWithClonedLimit);

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

export function exhaustUnitsInsteadOfResources(
    properties: IExhaustUnitsCostAdjusterProperties
) {
    return OngoingEffectBuilder.player.detached(EffectName.CostAdjuster, {
        apply: (player: Player, context: AbilityContext) => {
            Contract.assertTrue(context.source.hasCost());
            const adjuster = new ExhaustUnitsCostAdjuster(context.game, context.source, properties);
            player.addCostAdjuster(adjuster);
            return adjuster;
        },
        unapply: (player, _context, adjuster) => player.removeCostAdjuster(adjuster)
    });
}
