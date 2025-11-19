import type { DynamicOpportunityCost } from './DynamicOpportunityCost';
import { SimpleAdjustedCost } from './SimpleAdjustedCost';

/**
 * Helper class for cost evaluation which allows adding "dynamic" costs which are evaluated only at the end of the
 * cost evaluation process.
 *
 * This is required for situations like Exploit + Starhawk, where we can't know whether it's better to exploit Starhawk itself
 * until after all other discounts have been resolved due to the fact that its exact adjustment value is contingent on them.
 */
export class AdjustedCostEvaluator extends SimpleAdjustedCost {
    private readonly dynamicOffsets: DynamicOpportunityCost[] = [];

    public applyDynamicOffset(dynamicOpportunityCost: DynamicOpportunityCost) {
        this.dynamicOffsets.push(dynamicOpportunityCost);
    }

    protected override createCopy(): AdjustedCostEvaluator {
        throw new Error('Not implemented');
    }

    protected override computeLowestPossibleCost(): number {
        let currentRemainingCost = super.computeLowestPossibleCost();

        for (const dynamicOffset of this.dynamicOffsets.reverse()) {
            currentRemainingCost = dynamicOffset.getLowestPossibleRemainingCost(currentRemainingCost);
        }

        return currentRemainingCost;
    }
}
