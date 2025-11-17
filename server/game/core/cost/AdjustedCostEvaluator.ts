import * as Contract from '../utils/Contract';
import type { ICostAdjustEvaluationIntermediateResult } from './CostInterfaces';

export class SimpleAdjustedCost {
    private _value: number;

    public get value(): number {
        return this.computeLowestPossibleCost();
    }

    public constructor(initialCost: number) {
        Contract.assertNonNegative(initialCost, `Initial cost must be non-negative, instead got ${initialCost}`);
        this._value = initialCost;
    }

    public applyStaticIncrease(increaseAmount: number) {
        Contract.assertNonNegative(increaseAmount, `Increase amount must be non-negative, instead got ${increaseAmount}`);
        this._value += increaseAmount;
    }

    public applyStaticDecrease(decreaseAmount: number) {
        Contract.assertNonNegative(decreaseAmount, `Decrease amount must be non-negative, instead got ${decreaseAmount}`);
        this._value -= decreaseAmount;
        if (this._value < 0) {
            this._value = 0;
        }
    }

    public setRemainingToDiscountedValue(value: number) {
        this._value = value;
    }

    public copy(): SimpleAdjustedCost {
        const copy = this.createCopy();
        return copy;
    }

    protected createCopy(): SimpleAdjustedCost {
        return new SimpleAdjustedCost(this._value);
    }

    protected computeLowestPossibleCost(): number {
        return this._value;
    }
}

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
