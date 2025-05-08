import { PlayerOrCardAbility } from './PlayerOrCardAbility.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';

export class PlayerAction extends PlayerOrCardAbility {
    public cannotBeCancelled: boolean;

    public constructor(game, card, title, costs = [], targetResolver, triggerHandlingMode = TriggerHandlingMode.ResolvesTriggers) {
        const properties = { cost: costs, title, triggerHandlingMode, targetResolver: undefined };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(game, card, properties);
        this.cannotBeCancelled = true;
    }

    public getAdjustedCost(context) {
        const resourceCost = this.getCosts(context).find((cost) => cost.getAdjustedCost);
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}

export default PlayerAction;
