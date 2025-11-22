import * as Contract from '../../utils/Contract';
import type { ICostAdjustEvaluationIntermediateResult } from '../CostInterfaces';

/**
 * Helper class for cost evaluation which serves as a tracker for "dynamic opportunity costs" which are evaluated only at the end
 * of the cost evaluation process.
 *
 * This is required for situations like Exploit + Starhawk, where we can't know whether it's better to exploit Starhawk itself
 * until after all other discounts have been resolved due to the fact that its exact adjustment value is contingent on them.
 *
 * This class facilitates that by holding a function that calculates the discount value after all other discounts, and also
 * supports adding "alternate" flat discount costs for the Exploit case. These will be evaluated together to determine the
 * lowest possible value that must be paid.
 */
export class DynamicOpportunityCost {
    private computeDiscount: (remainingCost: number) => number;
    private alternateDiscounts: number[] = [];

    public constructor(computeDiscount: (remainingCost: number) => number, evaluationResult: ICostAdjustEvaluationIntermediateResult) {
        const alreadyAppliedDiscounts = evaluationResult.totalResourceCost - evaluationResult.adjustedCost.value;

        this.computeDiscount = (remainingCost: number) => {
            Contract.assertNonNegative(remainingCost, `Remaining cost must be non-negative, instead got ${remainingCost}`);
            return computeDiscount(remainingCost + alreadyAppliedDiscounts);
        };
    }

    public addAlternateDiscount(discountAmount: number) {
        Contract.assertPositiveNonZero(discountAmount, `Alternate discount amount must be positive non-zero, instead got ${discountAmount}`);
        this.alternateDiscounts.push(discountAmount);
    }

    public getLowestPossibleRemainingCost(currentRemainingCost: number): number {
        Contract.assertNonNegative(currentRemainingCost, `Current remaining cost must be non-negative, instead got ${currentRemainingCost}`);

        const computedDiscount = this.computeDiscount(currentRemainingCost);
        const allDiscounts = [computedDiscount, ...this.alternateDiscounts];
        const maxDiscount = Math.max(...allDiscounts);

        return Math.max(0, currentRemainingCost - maxDiscount);
    }
}
