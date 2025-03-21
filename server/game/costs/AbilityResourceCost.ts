import { ResourceCost } from './ResourceCost';
import type { CardAbility } from '../core/ability/CardAbility';
import type { Card } from '../core/card/Card';

/**
 * Represents a resource cost for triggering an ability.
 * Specifically should only be used for _ability costs_, not effects. E.g., is not used for In Debt to Crimson Dawn.
 */
export class AbilityResourceCost extends ResourceCost<Card> {
    public readonly isPlayCost = false;

    private readonly sourceAbility: CardAbility;

    public constructor(resources: number, sourceCard: Card, sourceAbility: CardAbility) {
        super(resources, sourceCard);

        this.sourceAbility = sourceAbility;
    }
}
