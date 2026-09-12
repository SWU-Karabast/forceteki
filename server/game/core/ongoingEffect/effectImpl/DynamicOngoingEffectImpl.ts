import type { AbilityContext } from '../../ability/AbilityContext';
import type { EffectName } from '../../Constants';
import type { Game } from '../../Game';
import { GameObject } from '../../GameObject';
import { registerState, stateRefMap } from '../../GameObjectUtils';
import { isSnapshotSafeOngoingEffectValue, MutableOngoingEffectValueWrapper } from './MutableOngoingEffectValueWrapper';
import { OngoingEffectValueWrapper, OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { StaticOngoingEffectImplBase } from './StaticOngoingEffectImpl';

export type CalculateOngoingEffect<TValue> = (target: any, context: AbilityContext, game: Game) => TValue;
export type CalculateOngoingEffectValueWrapper<TValue> = (target: any, context: AbilityContext, game: Game) => TValue | OngoingEffectValueWrapperBase<TValue>;
export type WrapOngoingEffectValue<TValue> = (game: Game, value: TValue) => OngoingEffectValueWrapperBase<TValue>;

// TODO: eventually this will subclass OngoingEffectImpl directly
@registerState()
export default class DynamicOngoingEffectImpl<TValue> extends StaticOngoingEffectImplBase<TValue> {
    private readonly calculate: CalculateOngoingEffectValueWrapper<TValue>;
    private readonly wrapValue?: WrapOngoingEffectValue<TValue>;

    @stateRefMap()
    private accessor values: Map<string, OngoingEffectValueWrapperBase<TValue>> = new Map();

    public constructor(game: Game,
        type: EffectName,
        calculate: CalculateOngoingEffectValueWrapper<TValue>,
        wrapValue?: WrapOngoingEffectValue<TValue>
    ) {
        super(game, type, null);
        this.calculate = calculate;
        this.wrapValue = wrapValue;
    }

    public override apply(effect, target) {
        super.apply(effect, target);

        this.recalculate(target);
    }

    public override recalculate(target) {
        const rawValue = this.calculate(target, this.context, this.game);

        // Defensive path: calculate() already built its own wrapper (used for values that manage their own
        // apply/unapply, e.g. GameObject-bearing or functional values). Preserve prior behavior exactly:
        // compare-then-allocate does not apply here because there is nothing further to allocate.
        if (rawValue instanceof OngoingEffectValueWrapperBase) {
            const oldValue = this.getValue(target);
            if (this.compareValues(oldValue, rawValue.getValue())) {
                this.setValue(target, rawValue);
                return true;
            }
            return false;
        }

        const oldValue = this.getValue(target);
        // Compare against the same nullish-to-true coercion OngoingEffectValueWrapperBase applies at
        // construction (boundary case 1), so a calculate() that returns null/undefined doesn't look like a
        // change on every recalculation.
        const candidate = (rawValue == null ? true : rawValue) as TValue;

        if (!this.compareValues(oldValue, candidate)) {
            // Unchanged: allocate nothing. This is the ordering fix for A1 - compare before wrapping.
            return false;
        }

        const existingEntry = this.values.get(target.uuid);
        const candidateIsSnapshotSafe = isSnapshotSafeOngoingEffectValue(candidate);

        // In-place reuse is sound only when all three hold: no custom wrap factory is in use, the candidate
        // value is provably safe to place in decorated state, and the entry already stored for this target is
        // itself a reusable mutable wrapper. An evicted mutable wrapper is never revived, and a value arriving
        // through a custom wrapValue or judged unsafe always allocates, matching today's retention model.
        if (!this.wrapValue && candidateIsSnapshotSafe && existingEntry instanceof MutableOngoingEffectValueWrapper) {
            existingEntry.setValue(rawValue);
            return true;
        }

        const newWrapper = this.wrapValue
            ? this.wrapValue(this.game, rawValue)
            : candidateIsSnapshotSafe
                ? new MutableOngoingEffectValueWrapper<TValue>(this.game, rawValue)
                : new OngoingEffectValueWrapper<TValue>(this.game, rawValue);

        this.setValue(target, newWrapper);
        return true;
    }

    public override getValue(target) {
        return this.values.get(target.uuid)?.getValue();
    }

    private setValue(target: GameObject, value: OngoingEffectValueWrapperBase<TValue>) {
        this.values.get(target.uuid)?.unapply(target);
        this.values.set(target.uuid, value);
        value.apply(target);
        return value.getValue();
    }

    private compareValues(oldValue: TValue, newValue: TValue) {
        // TODO: these comparison methods are really inefficient, consider a more explicit comparison implementation
        if (typeof oldValue === 'function' && typeof newValue === 'function') {
            return oldValue.toString() !== newValue.toString();
        }

        if (
            (Array.isArray(oldValue) && Array.isArray(newValue)) ||
            (typeof oldValue === 'object' && typeof newValue === 'object')
        ) {
            // Define a replacer function to handle complex objects that contain references to GameObjects.
            // Because each GameObject has a reference to the game instance and the game instance has a reference
            // to all GameObjects, we need to break the circular reference to be able to serialize the object and
            // we do so by replacing the GameObject with its uuid.
            const replacer = (key: string, value: any) => {
                if (value instanceof GameObject) {
                    return value.uuid;
                }
                return value;
            };

            return JSON.stringify(oldValue, replacer) !== JSON.stringify(newValue, replacer);
        }

        return oldValue !== newValue;
    }
}

module.exports = DynamicOngoingEffectImpl;

