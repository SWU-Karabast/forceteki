import type { FormatMessage } from '../../chat/GameChat';
import type { Game } from '../../Game';
import { registerState, stateValue } from '../../GameObjectUtils';
import { encodeStateValue } from '../../StateEncoding';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';

/**
 * A reusable value wrapper for the raw-value path of {@link DynamicOngoingEffectImpl}. Unlike
 * {@link OngoingEffectValueWrapper}, which is allocated fresh and pinned forever on every change,
 * this class is reused in place across recalculations for the same (effect, target) pair: its value
 * lives in decorated state, so rollback restores it through the normal state system instead of relying
 * on the old immutable instance surviving.
 *
 * Because the value is serialized with the rest of `state` by `GameStateManager.buildGameStateForSnapshot`,
 * it may only ever hold data the state encoder accepts (see `isSnapshotSafeOngoingEffectValue`, which asks
 * that encoder directly). Anything else - functions, GameObjectBase instances, foreign-prototype class
 * instances, non-finite numbers, Map/Set - must keep using the immutable `OngoingEffectValueWrapper`.
 *
 * The stored value may be an object the producer still owns by reference (e.g. `ProvidedAspects.forCard`
 * returns `card.aspects` directly) rather than a copy made for this wrapper. Treat the stored value as
 * read-only: nothing here copies it, and in-place mutation by the producer would silently edit decorated
 * state out from under the undo system.
 */
@registerState()
export class MutableOngoingEffectValueWrapper<TValue> extends OngoingEffectValueWrapperBase<TValue> {
    // allowGenericValue-justified: TValue is this class's own unresolved type parameter, not a concrete
    // Map/Set/Array - it cannot be proven non-collection at this declaration site (compile-verified,
    // P3-PB1 plan_v2.md §1.4 point 4: a naive constrained stateValue() genuinely fails to compile here, and
    // a tuple-wrapped variant fails identically, so this is not a distributivity workaround). A caller that
    // instantiates this class with a Map/Set/Array-shaped TValue still gets in-place-mutation observability
    // only if it separately wraps that value itself - this escape hatch does not add ValueMap/ValueSet/
    // ValueArray wrapping for such an instantiation, and is not meant to.
    @stateValue({ allowGenericValue: true })
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
 * Returns true when `value` is safe to store in this wrapper's decorated state. P3-PB2 fix
 * (`PB2I1-CS-01`): this is the encoder's own accept domain, obtained by running the encoder, plus the one
 * narrowing this wrapper needs on top of it.
 *
 * It used to be a hand-written third walk that agreed with `v8.serialize`, which was the sink until the
 * P3-PB2 cutover. Against `encodeStateValue` it was strictly *weaker* in three ways - it admitted
 * `NaN`/`±Infinity`, an `undefined` array element, and a plain object carrying `$map`/`$set`/`$num`/
 * `__proto__` as an own key - so a value this predicate blessed could make the next automatic snapshot
 * capture throw, which is a whole-game break rather than a failed undo. Delegating makes that divergence
 * structurally impossible instead of a thing to remember. The cost is one throwaway encoded copy on a path
 * that already walked the whole value and only runs when a dynamic effect value actually changed.
 *
 * `rejectCollections` carries the extra rule: a `Map`/`Set` encodes fine, but storing one here would need
 * `ValueMap`/`ValueSet` wrapping for in-place mutation to be observable, and this wrapper does not do that
 * - so such a value keeps using the immutable `OngoingEffectValueWrapper`, exactly as before.
 *
 * A shared-reference DAG (`const a = ['x']; ({ primary: a, secondary: a })`) is still accepted: the encoder
 * detects only a true cycle, using a path-scoped ancestor set for the same reason the old predicate did -
 * a visited-everywhere set would misclassify that DAG as cyclic and fall back to the pinned-wrapper path,
 * reintroducing the unbounded growth this wrapper exists to remove.
 *
 * The bare `catch` is wider than that domain, deliberately. It answers "unsafe" not only for the encoder's
 * own rejections but for *any* throw raised while walking the value - a getter on the effect's computed
 * object that throws, or a structure deep enough to exhaust the stack - where the old hand-written
 * predicate propagated both. That is a knowing trade and not a silent degradation of state: the fallback is
 * the immutable `OngoingEffectValueWrapper`, which stores its value in a plain undecorated field
 * (`OngoingEffectValueWrapper.ts`), so a value routed there never reaches the encoder again and cannot
 * break a later capture. What it does cost is diagnosis - an engine defect in a `calculate` shows up as
 * this effect quietly losing its mutable-wrapper retention rather than as a stack trace. If that ever needs
 * to be visible, narrow the catch to the encoder's own `Error` shape rather than removing the fallback.
 */
export function isSnapshotSafeOngoingEffectValue(value: unknown): boolean {
    try {
        encodeStateValue('MutableOngoingEffectValueWrapper._value', value, { rejectCollections: true });
        return true;
    } catch {
        return false;
    }
}
