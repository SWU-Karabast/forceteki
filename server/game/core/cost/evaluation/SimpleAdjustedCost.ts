import type { Aspect } from '../../Constants';
import * as Contract from '../../utils/Contract';

interface IPenaltyAspect {
    aspect: Aspect;
    applyPenalty: boolean;
}

/**
 * A simple tracking object for adjusted cost values that supports applying increases and decreases.
 * This mostly exists to serve as a parent class for {@link AdjustedCostEvaluator}, so that there is a consistent
 * interface for applying cost adjustments between the evaluation and the trigger stages.
 */
export class SimpleAdjustedCost {
    private _penaltyAspects: IPenaltyAspect[] = [];
    private _totalResourceCost: number;
    private _value: number;

    public get penaltyAspects(): Aspect[] {
        return this._penaltyAspects.map((entry) => entry.aspect);
    }

    public get value(): number {
        return this.computeLowestPossibleCost();
    }

    public constructor(initialCost: number, penaltyAspects?: Aspect[]) {
        Contract.assertNonNegative(initialCost, `Initial cost must be non-negative, instead got ${initialCost}`);

        this._value = initialCost;
        this._totalResourceCost = initialCost;

        if (penaltyAspects) {
            this._penaltyAspects = penaltyAspects.map((aspect) => ({ aspect, applyPenalty: true }));
        }
    }

    public applyStaticIncrease(increaseAmount: number) {
        Contract.assertNonNegative(increaseAmount, `Increase amount must be non-negative, instead got ${increaseAmount}`);
        this._value += increaseAmount;
        this._totalResourceCost += increaseAmount;
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

    public disableAspectPenalty(aspect: Aspect) {
        const matchingPenalties = this._penaltyAspects.filter((entry) => entry.aspect === aspect);
        for (const penaltyEntry of matchingPenalties) {
            penaltyEntry.applyPenalty = false;
        }
    }

    public disableAllAspectPenalties() {
        for (const penaltyEntry of this._penaltyAspects) {
            penaltyEntry.applyPenalty = false;
        }
    }

    public copy(): SimpleAdjustedCost {
        const copy = this.createCopy();
        return copy;
    }

    public getTotalResourceCost(includeAspectPenalties = true): number {
        return this._totalResourceCost + (includeAspectPenalties ? this.computeAspectPenaltyTotal() : 0);
    }

    protected createCopy(): SimpleAdjustedCost {
        return new SimpleAdjustedCost(this._value);
    }

    protected computeLowestPossibleCost(): number {
        return this._value + this.computeAspectPenaltyTotal();
    }

    private computeAspectPenaltyTotal(): number {
        return this._penaltyAspects.filter((entry) => entry.applyPenalty).length * 2;
    }
}
