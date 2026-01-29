import { ResourceCost } from './ResourceCost';
import type { Card } from '../core/card/Card';
import { ResourceCostType } from '../core/cost/CostInterfaces';

/**
 * Represents a resource cost for triggering an ability.
 * Specifically should only be used for _ability costs_, not effects. E.g., is not used for In Debt to Crimson Dawn.
 */
export class AbilityResourceCost extends ResourceCost<Card> {
    public override get resourceCostType(): ResourceCostType {
        return ResourceCostType.Ability;
    }
}
