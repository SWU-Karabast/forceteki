import { PlayerOrCardAbility } from './PlayerOrCardAbility.js';
import { TriggerHandlingMode } from '../event/EventWindow.js';
import type Game from '../Game.js';
import type { Card } from '../card/Card.js';
import type { AbilityContext } from './AbilityContext.js';

export class PlayerAction extends PlayerOrCardAbility {
    public cannotBeCancelled: boolean;

    public constructor(game: Game, card: Card, title: string, costs = [], targetResolver, triggerHandlingMode = TriggerHandlingMode.ResolvesTriggers) {
        const properties = { cost: costs, title, triggerHandlingMode, targetResolver: undefined };
        if (targetResolver) {
            properties.targetResolver = targetResolver;
        }
        super(game, card, properties);
        this.cannotBeCancelled = true;
    }

    public getAdjustedCost(context: AbilityContext): number {
        const resourceCost = this.getCosts(context).find((cost) => cost.isResourceCost());
        return resourceCost ? resourceCost.getAdjustedCost(context) : 0;
    }
}
