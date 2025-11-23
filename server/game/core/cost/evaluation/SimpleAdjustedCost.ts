import type { Aspect } from '../../Constants';
import * as Contract from '../../utils/Contract';

interface IPenaltyAspect {
    aspect: Aspect;
    penaltyDisabled: boolean;
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
            this._penaltyAspects = penaltyAspects.map((aspect) => ({ aspect, penaltyDisabled: false }));
            this.applyStaticIncrease(penaltyAspects.length * 2);
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
        const matchingEnabledPenalties = this._penaltyAspects.filter(
            (entry) => entry.aspect === aspect && !entry.penaltyDisabled
        );

        for (const penaltyEntry of matchingEnabledPenalties) {
            penaltyEntry.penaltyDisabled = true;
            this.applyStaticDecrease(2);
        }
    }

    public disableAllAspectPenalties() {
        const enabledPenalties = this._penaltyAspects.filter((entry) => !entry.penaltyDisabled);

        for (const penaltyEntry of enabledPenalties) {
            penaltyEntry.penaltyDisabled = true;
            this.applyStaticDecrease(2);
        }
    }

    public copy(): SimpleAdjustedCost {
        const copy = this.createCopy();
        return copy;
    }

    public getTotalResourceCost(includeAspectPenalties = true): number {
        return this._totalResourceCost - (includeAspectPenalties ? 0 : this.penaltyAspects.length * 2);
    }

    protected createCopy(): SimpleAdjustedCost {
        const copy = new SimpleAdjustedCost(this._value);
        copy._penaltyAspects = this._penaltyAspects.map((entry) => ({ ...entry }));
        return copy;
    }

    protected computeLowestPossibleCost(): number {
        return this._value;
    }
}
