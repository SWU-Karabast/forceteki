import type { AbilityContext } from './AbilityContext.js';
import PlayerOrCardAbility from './PlayerOrCardAbility.js';
import { PhaseName } from '../Constants.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';

export default class PlayerAction extends PlayerOrCardAbility {
    protected cannotBeCancelled: boolean;

    public constructor(game, card, title, costs = [], targetResolver, triggerHandlingMode = TriggerHandlingMode.ResolvesTriggers) {
        const properties = { cost: costs, title, triggerHandlingMode, targetResolver: undefined };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(game, card, properties);
        this.cannotBeCancelled = true;
    }

    public override meetsRequirements(context: AbilityContext, ignoredRequirements: string[] = []) {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase !== PhaseName.Action
        ) {
            return 'phase';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    public getAdjustedCost(context) {
        const resourceCost = this.getCosts(context).find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}
