import type { Card } from '../core/card/Card';
import { ResourceCostType } from '../core/cost/CostInterfaces';
import { ResourceCost } from './ResourceCost';

export class CardEffectResourcePayment extends ResourceCost<Card> {
    public override get resourceCostType(): ResourceCostType {
        return ResourceCostType.CardEffectPayment;
    }
}