import * as Contract from '../../utils/Contract';

/**
 * A simple tracking object for adjusted cost values that supports applying increases and decreases.
 * This mostly exists to serve as a parent class for {@link AdjustedCostEvaluator}, so that there is a consistent
 * interface for applying cost adjustments between the evaluation and the trigger stages.
 */
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