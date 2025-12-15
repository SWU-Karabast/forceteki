import type { Card } from '../core/card/Card';
import { ResourceCostType } from '../core/cost/CostInterfaces';
import { ResourceCost } from './ResourceCost';

export class GameEffectResourcePayment extends ResourceCost<Card> {
    public override get resourceCostType(): ResourceCostType {
        return ResourceCostType.GameEffectPayment;
    }
}