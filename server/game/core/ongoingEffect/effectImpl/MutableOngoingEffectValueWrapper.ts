import type { FormatMessage } from '../../chat/GameChat';
import type { Game } from '../../Game';
import { GameObjectBase } from '../../GameObjectBase';
import { registerState, stateValue } from '../../GameObjectUtils';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';

/**
 * A reusable value wrapper for the raw-value path of {@link DynamicOngoingEffectImpl}. Unlike
 * {@link OngoingEffectValueWrapper}, which is allocated fresh and pinned forever on every change,
 * this class is reused in place across recalculations for the same (effect, target) pair: its value
 * lives in decorated state, so rollback restores it through the normal state system instead of relying
 * on the old immutable instance surviving.
 *
 * Because the value is serialized with the rest of `state` by `GameStateManager.buildGameStateForSnapshot`,
 * it may only ever hold structured-clone-safe data (see `isSnapshotSafeOngoingEffectValue`). Anything else
 * (functions, GameObjectBase instances, foreign-prototype class instances) must keep using the immutable
 * `OngoingEffectValueWrapper`.
 *
 * The stored value may be an object the producer still owns by reference (e.g. `ProvidedAspects.forCard`
 * returns `card.aspects` directly) rather than a copy made for this wrapper. Treat the stored value as
 * read-only: nothing here copies it, and in-place mutation by the producer would silently edit decorated
 * state out from under the undo system.
 */
@registerState()
export class MutableOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapperBase<TValue> {
    @stateValue()
    private accessor _value: TValue;

    public constructor(game: Game, value: TValue, effectDescription?: FormatMessage | string) {
        // Pass `undefined` (never the real value) to the base constructor so its non-decorated `value` field
        // becomes an obviously-inert `true` rather than a plausible-looking copy that would silently go stale
        // the moment setValue() below (or any later call) diverges from it. The class-field accessor's `init`
        // runs immediately when `super()` returns and before the rest of this constructor body executes, so
        // `_value` is safely initialized before setValue() writes to it. The nullish-to-true coercion then
        // lives in exactly one functionally-relevant place: setValue().
        super(game, undefined, effectDescription);
        this.setValue(value);
    }

    public override getValue(): TValue {
        return this._value;
    }

    public setValue(value: TValue): void {
        // @ts-expect-error mirrors the base class's nullish-to-true coercion at construction time.
        this._value = value == null ? true : value;
    }

    public override getGameObjectName() {
        return 'MutableOngoingEffectValueWrapper';
    }
}

/**
 * Returns true when `value` is safe to store in decorated state: it survives `v8.serialize` and contains
 * no functions, no `GameObjectBase` instances, and no class instances with a foreign (non-plain,
 * non-array) prototype. Recurses through plain objects and arrays and terminates on cycles.
 *
 * `ancestors` tracks only the current recursion path (added before recursing into a node, removed once
 * that node's subtree is fully checked), not every node visited overall. This rejects a true cycle - a
 * node that contains itself somewhere along its own path - while still accepting a shared-reference DAG
 * such as `const a = ['x']; ({ primary: a, secondary: a })`, where `a` is visited twice but never appears
 * on its own ancestor path. A visited-everywhere set would misclassify that DAG as cyclic and silently
 * fall back to the immutable-pinned-wrapper path, reintroducing the unbounded growth this wrapper exists
 * to remove.
 */
export function isSnapshotSafeOngoingEffectValue(value: unknown, ancestors = new Set<object>()): boolean {
    if (value === null || value === undefined) {
        return true;
    }

    const valueType = typeof value;
    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        return true;
    }

    if (valueType !== 'object') {
        // functions, symbols, bigints, etc.
        return false;
    }

    if (value instanceof GameObjectBase) {
        return false;
    }

    if (ancestors.has(value as object)) {
        // Reject rather than recurse forever; a cyclic graph is not a shape this predicate needs to accept.
        return false;
    }

    if (Array.isArray(value)) {
        ancestors.add(value as object);
        const result = value.every((element) => isSnapshotSafeOngoingEffectValue(element, ancestors));
        ancestors.delete(value as object);
        return result;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        // A class instance with a foreign prototype: Map, Set, Date, KeywordInstance, AbilityLimit, etc.
        return false;
    }

    ancestors.add(value as object);
    const result = Object.values(value as Record<string, unknown>).every((propertyValue) => isSnapshotSafeOngoingEffectValue(propertyValue, ancestors));
    ancestors.delete(value as object);
    return result;
}
