import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import {
    decodeStateValue,
    encodeRefMap,
    encodeRefSet,
    encodeStateValue,
} from '../../../server/game/core/StateEncoding';
import {
    assertJsonSafeStateValue,
    getRuntimeStateFieldModelByClassName,
    registerState,
    registerStateBase,
    stateRef,
    stateRefArray,
    stateRefMap,
    stateRefRecord,
    stateRefSet,
    statePrimitive,
    stateValue,
    stateMap,
    stateSet,
    stateArray,
    ValueMap,
    ValueSet,
    ValueArray,
} from '../../../server/game/core/GameObjectUtils';
import type { IStateArray } from '../../../server/game/core/GameObjectUtils';

/** Small purpose-built fixture: a real @stateValue accessor with a JSON-safe default, for exercising the decorator's set()/get() wiring (not just the underlying validator function). */
@registerState()
class JsonSafeStateValueFixture extends GameObjectBase {
    @stateValue() public accessor value: unknown = null;
}

/** A second fixture whose accessor is given a JSON-unsafe default, so construction exercises the decorator's init() path. */
@registerState()
class InvalidInitJsonStateValueFixture extends GameObjectBase {
    @stateValue() public accessor value: unknown = (() => 1) as unknown;
}

/**
 * `P3-PA4` (AC1): a fixture carrying one field of every decorator kind, including both `@statePrimitive`
 * and `@stateValue` on the same class - the one previously-invisible kind pair (`GameObjectUtils.ts`
 * lumped both into one bucket before this unit's additive `stateSimpleKindMetadata` write).
 */
@registerState()
class AllFieldKindsFixture extends GameObjectBase {
    @statePrimitive() public accessor primitiveField: string = 'a';
    @stateValue() public accessor valueField: unknown = null;
    @stateRef() public accessor refField: GameObjectBase | null = null;
    @stateRefArray() public accessor refArrayField: readonly GameObjectBase[] = [];
    @stateRefMap() public accessor refMapField: Map<string, GameObjectBase> = new Map();
    @stateRefSet() public accessor refSetField: Set<GameObjectBase> = new Set();
    @stateRefRecord() public accessor refRecordField: Record<string, GameObjectBase> = {};
}

/**
 * `P3-PB2` (C4): the mutable `@stateRefArray(false)` variant `AllFieldKindsFixture` does not carry, plus a
 * `@statePrimitive` numeric field, so the eager-marking and non-finite-storage cases below can exercise
 * the wrapped-array path and the primitive backing field directly.
 */
@registerState()
class CutoverMarkingFixture extends GameObjectBase {
    @statePrimitive() public accessor numberField: number = 0;
    @stateRefArray(false) public accessor mutableRefArrayField: IStateArray<GameObjectBase> = [] as unknown as IStateArray<GameObjectBase>;
}

/**
 * `P3-PB1` (AC2-AC6): a fixture carrying one field of each of the three new value-collection decorators.
 *
 * P3-PB2 note: this fixture is declared in this spec file, so the generator (which only scans the server
 * tree) has no registry entry for it - `getStateSerializerFor(fixture)` would walk up to `GameObjectBase`
 * and return a serializer that emits `_uuid` only, silently dropping every field these cases are about.
 * The cases below therefore call the `StateEncoding.ts` codecs directly, which is precisely the code the
 * generated functions emit for these field kinds.
 */
@registerState()
class ValueCollectionFieldsFixture extends GameObjectBase {
    @stateMap() public accessor mapField: Map<string, number> = new Map();
    @stateSet() public accessor setField: Set<number> = new Set();
    @stateArray() public accessor arrayField: string[] = [];
}

/**
 * `P3-PB1` (§1.4 point 5 / §2.3): regression coverage for the generic-escape-hatch overload, mirroring
 * `MutableOngoingEffectValueWrapper<TValue>._value` - a field whose *declared* type is an unresolved class
 * type parameter, which cannot compile under bare `@stateValue()`'s constrained overload (§1.4 point 4).
 */
@registerState()
class GenericEscapeHatchValueFixture<TValue> extends GameObjectBase {
    // allowGenericValue-justified: TValue is this fixture's own unresolved type parameter, exercising the
    // same shape as MutableOngoingEffectValueWrapper._value - regression coverage for the escape hatch itself
    // (P3-PB1 §1.4 point 5), not a real product field.
    @stateValue({ allowGenericValue: true }) public accessor value: TValue;
}

/**
 * `P3-PB1` (§5 item 4c, AC2): compile-only negative fixtures. Each is immediately preceded by a
 * `@ts-expect-error` directive that the compiler itself enforces (an unused directive is itself a compile
 * error), so a clean `tsc` pass over this file with these fixtures present proves each negative case
 * actually occurred. None is ever instantiated; each is exported so `@typescript-eslint/no-unused-vars`
 * does not flag it (confirmed lint-clean, per plan_v2.md §8 item 1).
 */
@registerState()
export class NegativeStateMapOnArrayFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: @stateMap() requires a Map<string, TValue>-typed accessor, not an array.
    @stateMap() public accessor value: string[] = [];
}

@registerState()
export class NegativeStateSetOnMapFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: @stateSet() requires a Set<TValue>-typed accessor, not a Map.
    @stateSet() public accessor value: Map<string, number> = new Map();
}

@registerState()
export class NegativeStateArrayOnMapFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: @stateArray() requires an array-typed accessor, not a Map.
    @stateArray() public accessor value: Map<string, number> = new Map();
}

@registerState()
export class NegativeStateValueOnMapFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: bare @stateValue() rejects a concrete Map-typed accessor; use @stateMap().
    @stateValue() public accessor value: Map<string, number> = new Map();
}

@registerState()
export class NegativeStateValueOnSetFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: bare @stateValue() rejects a concrete Set-typed accessor; use @stateSet().
    @stateValue() public accessor value: Set<number> = new Set();
}

@registerState()
export class NegativeStateValueOnArrayFixture extends GameObjectBase {
    // @ts-expect-error P3-PB1 AC2: bare @stateValue() rejects a concrete array-typed accessor; use @stateArray().
    @stateValue() public accessor value: string[] = [];
}

/**
 * `P3-PA4` (AC1(b), corrected fixture shape per plan.md §0.1 item 3): a `@registerStateBase` intermediate
 * class declared *inside* a factory function, mirroring `WithDamage`'s real shape
 * (`propertyMixins/Damage.ts`) - the previously-prescribed "undecorated mixin-only ancestor" is structurally
 * impossible in this codebase and throws at class-definition time (`GameObjectUtils.ts`'s `registerState()`
 * parent-registration guard).
 */
function WithFactoryDeclaredFragment<TBase extends abstract new (...args: any[]) => GameObjectBase>(BaseClass: TBase) {
    @registerStateBase()
    abstract class FactoryDeclaredFragment extends BaseClass {
        @statePrimitive() public accessor fragmentField: string = 'fragment';
    }
    return FactoryDeclaredFragment;
}

@registerState()
class ConcreteFragmentDescendantFixture extends WithFactoryDeclaredFragment(GameObjectBase) {
    @statePrimitive() public accessor concreteField: string = 'concrete';
}

/**
 * `P3-PA4` (PA4-IR2-1 fix-pass): a top-level, single-declaration `@registerStateBase` fixture - standing
 * in for real production classes like `ZoneAbstract`/`Card`/`CardAbility`, which are declared once at
 * module scope (not inside a multiply-invoked factory function) and were found completely unguarded
 * against a same-name collision with a different field shape.
 */
@registerStateBase()
abstract class TopLevelBaseFixture extends GameObjectBase {
    @statePrimitive() public accessor topLevelField: string = 'a';
}

/**
 * `P3-PA4` (PA4-IR2-1 fix-pass): two distinct top-level `@registerStateBase` fixtures used as the base
 * class for `WithRepeatableFragment` below, so its two call sites produce classes whose *flattened*
 * models legitimately differ (different base fields) while their *own* models stay identical - the same
 * shape as the real `AsLeader` (`WithLeaderProperties()`) case.
 */
@registerStateBase()
abstract class BaseVariantAFixture extends GameObjectBase {
    @statePrimitive() public accessor variantAField: string = 'a';
}

@registerStateBase()
abstract class BaseVariantBFixture extends GameObjectBase {
    @statePrimitive() public accessor variantBField: string = 'b';
}

/**
 * `P3-PA4` (PA4-IR2-1 fix-pass): a factory-declared `@registerStateBase` fragment invoked more than once,
 * mirroring `WithLeaderProperties()`'s `AsLeader` - each call re-executes the same class body under the
 * same name but against a different base class, which is the legitimate re-registration case the guard
 * must allow.
 */
function WithRepeatableFragment<TBase extends abstract new (...args: any[]) => GameObjectBase>(BaseClass: TBase) {
    @registerStateBase()
    abstract class RepeatableFragment extends BaseClass {
        @statePrimitive() public accessor repeatableField: string = 'repeatable';
    }
    return RepeatableFragment;
}

describe('assertJsonSafeStateValue', function() {
    describe('accepts', function() {
        it('null and undefined', function() {
            expect(() => assertJsonSafeStateValue('prop', null)).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', undefined)).not.toThrow();
        });

        it('strings, booleans, and finite numbers', function() {
            expect(() => assertJsonSafeStateValue('prop', 'a string')).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', true)).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', false)).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', 0)).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', -12.5)).not.toThrow();
        });

        it('a branded GameObjectId, since it is just a string at runtime', function() {
            const { game } = gameObjectHelper.createMockGame();
            const gameObject = new gameObjectHelper.TestGameObject(game, 'ready');
            const id = gameObject.getObjectId();

            expect(typeof id).toBe('string');
            expect(() => assertJsonSafeStateValue('prop', id)).not.toThrow();
        });

        it('an object created with Object.create(null), which has no prototype at all', function() {
            const value = Object.create(null);
            value.a = 1;

            expect(() => assertJsonSafeStateValue('prop', value)).not.toThrow();
        });

        it('plain objects and arrays, recursing into every property/element', function() {
            const value = {
                a: 1,
                b: 'two',
                c: [1, 2, { nested: true }],
                d: null,
                e: undefined
            };

            expect(() => assertJsonSafeStateValue('prop', value)).not.toThrow();
        });

        it('empty and populated Map/Set instances with JSON-safe elements', function() {
            const map = new Map<string, number>([['a', 1], ['b', 2]]);
            const set = new Set<string>(['x', 'y']);

            expect(() => assertJsonSafeStateValue('prop', new Map())).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', new Set())).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', map)).not.toThrow();
            expect(() => assertJsonSafeStateValue('prop', set)).not.toThrow();
        });

        it('a Map/Set nested inside a plain object', function() {
            const value = {
                counts: new Map<string, number>([['a', 1]]),
                tags: new Set<string>(['x'])
            };

            expect(() => assertJsonSafeStateValue('prop', value)).not.toThrow();
        });

        it('a shared-reference DAG that is not a true cycle', function() {
            const shared = ['x'];
            const value = { primary: shared, secondary: shared };

            expect(() => assertJsonSafeStateValue('prop', value)).not.toThrow();
        });
    });

    describe('rejects', function() {
        it('NaN and Infinity', function() {
            expect(() => assertJsonSafeStateValue('prop', NaN)).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', Infinity)).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', -Infinity)).toThrowError(/not JSON-safe/);
        });

        it('functions, symbols, and bigints', function() {
            expect(() => assertJsonSafeStateValue('prop', () => 1)).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', Symbol('x'))).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', BigInt(1))).toThrowError(/not JSON-safe/);
        });

        it('a class instance with a foreign prototype', function() {
            class SomeClass {
                public field = 1;
            }

            expect(() => assertJsonSafeStateValue('prop', new SomeClass())).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', new Date())).toThrowError(/not JSON-safe/);
        });

        it('a GameObjectBase instance, with a message directing the author to GameObjectId', function() {
            const { game } = gameObjectHelper.createMockGame();
            const gameObject = new gameObjectHelper.TestGameObject(game, 'ready');

            expect(() => assertJsonSafeStateValue('prop', gameObject)).toThrowError(/GameObjectId/);
        });

        it('a value nested inside a plain object, array, Map, or Set', function() {
            expect(() => assertJsonSafeStateValue('prop', { nested: () => 1 })).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', [NaN])).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', new Map([['a', () => 1]]))).toThrowError(/not JSON-safe/);
            expect(() => assertJsonSafeStateValue('prop', new Set([new Date()]))).toThrowError(/not JSON-safe/);
        });

        it('a circular reference', function() {
            const value: Record<string, unknown> = { a: 1 };
            value.self = value;

            expect(() => assertJsonSafeStateValue('prop', value)).toThrowError(/circular reference/);
        });

        it('a Map with a non-string key', function() {
            const numberKeyedMap = new Map<unknown, string>([[1, 'a']]);
            const objectKeyedMap = new Map<unknown, string>([[{}, 'a']]);

            expect(() => assertJsonSafeStateValue('prop', numberKeyedMap)).toThrowError(/non-string key/);
            expect(() => assertJsonSafeStateValue('prop', objectKeyedMap)).toThrowError(/non-string key/);
        });

        it('names the offending property/accessor in the error message', function() {
            expect(() => assertJsonSafeStateValue('myAccessorName', () => 1)).toThrowError(/myAccessorName/);
        });

        /**
         * `P3-PB2` fix (`PB2I2-N2`). This gate's stated premise is that it is the encoder's own own-key
         * domain restated at the write site, not a second opinion about it, so the two have to agree on the
         * *predicate* as well as the key set. Both now test the enumerable own keys. The assertion that
         * carries the weight is the pairing: each key rejected here must also be rejected by
         * `encodeStateValue`, and a divergence in either direction (a key the gate admits and capture then
         * throws on, or a key the gate rejects that would have encoded) turns this red.
         */
        it('every reserved own key, in step with the encoder that has to serialize what it admits', function() {
            for (const reservedKey of ['$map', '$set', '$num', '__proto__']) {
                // An object literal would set the prototype rather than create an own `__proto__` key.
                const carrier = JSON.parse(`{"${reservedKey}": 1, "ok": 2}`);
                expect(Object.keys(carrier)).toContain(reservedKey);

                expect(() => assertJsonSafeStateValue('prop', carrier)).toThrowError(/not JSON-safe/);
                expect(() => encodeStateValue('prop', carrier)).toThrow();
                expect(() => assertJsonSafeStateValue('prop', { nested: carrier })).toThrowError(/not JSON-safe/);
                expect(() => encodeStateValue('prop', { nested: carrier })).toThrow();
            }
        });
    });
});

describe('the @stateValue decorator', function() {
    it('rejects an invalid value assigned to a real @stateValue accessor', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new JsonSafeStateValueFixture(game);

        expect(() => {
            fixture.value = () => 1;
        }).toThrowError(/not JSON-safe/);
    });

    it('accepts a valid value assigned to a real @stateValue accessor', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new JsonSafeStateValueFixture(game);

        expect(() => {
            fixture.value = { a: 1, tags: new Set(['x']) };
        }).not.toThrow();
        expect(fixture.value).toEqual({ a: 1, tags: new Set(['x']) });
    });

    it('rejects an invalid value at construction, via init', function() {
        const { game } = gameObjectHelper.createMockGame();

        expect(() => new InvalidInitJsonStateValueFixture(game)).toThrowError(/not JSON-safe/);
    });
});

describe('the @stateMap / @stateSet / @stateArray decorators (P3-PB1)', function() {
    it('wraps a Map/Set/Array field in ValueMap/ValueSet/ValueArray at construction, and re-wraps to a fresh instance on whole-value reassignment', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);

        expect(fixture.mapField instanceof ValueMap).toBe(true);
        expect(fixture.setField instanceof ValueSet).toBe(true);
        expect(fixture.arrayField instanceof ValueArray).toBe(true);

        const oldMap = fixture.mapField;
        const oldSet = fixture.setField;
        const oldArray = fixture.arrayField;

        fixture.mapField = new Map([['a', 1]]);
        fixture.setField = new Set([1]);
        fixture.arrayField = ['x'];

        expect(fixture.mapField).not.toBe(oldMap);
        expect(fixture.setField).not.toBe(oldSet);
        expect(fixture.arrayField).not.toBe(oldArray);
        expect(fixture.mapField instanceof ValueMap).toBe(true);
        expect(fixture.setField instanceof ValueSet).toBe(true);
        expect(fixture.arrayField instanceof ValueArray).toBe(true);
        expect([...fixture.mapField.entries()]).toEqual([['a', 1]]);
        expect([...fixture.setField.values()]).toEqual([1]);
        expect([...fixture.arrayField]).toEqual(['x']);
    });

    it('behaves identically to the native collection for in-place mutation (functional parity: Map/Set/Array)', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);

        fixture.mapField.set('a', 1);
        fixture.mapField.set('b', 2);
        expect(fixture.mapField.get('a')).toBe(1);
        expect(fixture.mapField.size).toBe(2);
        expect(fixture.mapField.delete('a')).toBe(true);
        expect(fixture.mapField.has('a')).toBe(false);
        fixture.mapField.clear();
        expect(fixture.mapField.size).toBe(0);

        fixture.setField.add(1);
        fixture.setField.add(2);
        expect([...fixture.setField]).toEqual([1, 2]);
        expect(fixture.setField.delete(1)).toBe(true);
        expect(fixture.setField.has(1)).toBe(false);
        fixture.setField.clear();
        expect(fixture.setField.size).toBe(0);

        fixture.arrayField.push('a', 'b');
        expect(fixture.arrayField.length).toBe(2);
        expect(fixture.arrayField.pop()).toBe('b');
        fixture.arrayField.splice(0, 1, 'c', 'd');
        expect([...fixture.arrayField]).toEqual(['c', 'd']);
    });

    it('leaves a plain-typed @stateValue field unaffected (JsonSafeStateValueFixture, no wrapping)', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new JsonSafeStateValueFixture(game);

        fixture.value = { a: 1 };
        expect(fixture.value).toEqual({ a: 1 });
        expect(fixture.value instanceof ValueMap).toBe(false);
    });

    it('exercises the generic-escape-hatch fixture get/set (mirrors MutableOngoingEffectValueWrapper._value)', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new GenericEscapeHatchValueFixture<number>(game);

        fixture.value = 5;
        expect(fixture.value).toBe(5);
    });

    /**
     * P3-PB2 replacement for the two retired `v8` byte-parity cases. A `ValueArray` no longer reaches
     * `v8.serialize` at all - `encodeStateValue` walks it into a plain array - so byte parity against a
     * plain collection is no longer the observable. What still matters, and is what those cases actually
     * guarded, is that `CreateValueArrayInternal`'s `.from()` recipe produces a **dense** array: the recipe
     * `P3-PB1` rejected (`new ValueArray()` + `length =` + index assignment) produces a holey array, which
     * encodes differently. Both halves are asserted, so the guard cannot pass on shape alone.
     */
    it('encodes the three wrappers to a plain array / $map / $set, and the production ValueArray recipe stays dense', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);
        fixture.mapField.set('a', 1);
        fixture.mapField.set('b', 2);
        fixture.setField.add(1);
        fixture.setField.add(2);
        fixture.arrayField.push('x', 'y', 'z');

        expect(encodeStateValue('mapField', fixture.mapField)).toEqual({ $map: [['a', 1], ['b', 2]] });
        expect(encodeStateValue('setField', fixture.setField)).toEqual({ $set: [1, 2] });

        // Built through the production path (the accessor's CreateValueArrayInternal -> ValueArray.from).
        const encodedDense = encodeStateValue('arrayField', fixture.arrayField) as string[];
        expect(encodedDense).toEqual(['x', 'y', 'z']);
        expect(Object.keys(encodedDense).length).toBe(encodedDense.length);

        // The rejected recipe, for contrast, and the reason the density assertion above is load-bearing
        // rather than cosmetic: a holey ValueArray does not merely encode differently, it does not encode at
        // all - `encodeStateValue` refuses an `undefined` array element outright. So a regression to
        // `new ValueArray()` + `length =` + index assignment would take every snapshot of that field down
        // with it.
        const holey = new ValueArray<string>();
        holey.length = 3;
        holey[0] = 'x';
        holey[2] = 'z';
        expect(Object.keys(holey).length).not.toBe(holey.length);
        expect(() => encodeStateValue('holey', holey)).toThrowError(/may not be undefined/);
    });

    /**
     * AC5, pinned ordering (PB1-W3): the buffer must be captured *before* the second mutation, and restore
     * must come from that captured buffer, not a live reference - otherwise the assertion would pass
     * vacuously regardless of restore correctness.
     */
    it('rolls back a @stateMap field to its captured contents, discarding a later in-place mutation, and keeps the field a ValueMap afterward', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);
        fixture.mapField.set('a', 1);

        // Capture strictly before the second mutation below - that ordering is what keeps the assertion
        // non-vacuous (PB1-W3).
        const record = encodeStateValue('mapField', fixture.mapField);

        fixture.mapField.set('b', 2);
        expect(fixture.mapField.size).toBe(2);

        // Restore from the captured record, not a live reference. This is exactly the whole-field
        // reassignment the generated `value`-kind deserializer performs.
        fixture.mapField = decodeStateValue(record) as Map<string, number>;

        expect([...fixture.mapField.entries()]).toEqual([['a', 1]]);
        expect(fixture.mapField instanceof ValueMap).toBe(true);
    });
});

/**
 * Regression coverage for the `UndoMap`/`UndoSet` pre-initialization-window defect: both classes used to
 * take the incoming entries through `super(entries)`, which makes `Map`/`Set`'s own constructor call the
 * overridden `set()`/`add()` before the subclass's private fields exist on `this`. The `#init` flag those
 * overrides read was believed to evaluate falsy in that window; it actually throws
 * `TypeError: Cannot read private member ...`, so assigning a *populated* Map/Set wholesale to a
 * `@stateRefMap`/`@stateRefSet` field threw. Nothing in the engine assigned a populated collection to one
 * of those fields (every live user mutates in place, and the generated deserializers assign an empty
 * collection and then populate it), so the suite never reached it - these tests do, deliberately.
 *
 * The empty cases are asserted alongside so a future change that fixes only the populated path, or breaks
 * the mirror write on the path after construction, is still caught.
 */
describe('the @stateRefMap / @stateRefSet decorators, assigned a populated collection wholesale', function() {
    // P3-PB2: the id mirror these cases used to read out of the state bag is gone. The encoders are what
    // the generated serializer emits for these two field kinds, and they are the observation point that
    // survives the cutover. `AllFieldKindsFixture` is spec-local, so the codecs are called directly rather
    // than through `getStateSerializerFor` (see ValueCollectionFieldsFixture's note above).
    function idsOf(fixture: AllFieldKindsFixture) {
        return {
            mapIds: encodeRefMap(fixture.refMapField).$map,
            setIds: encodeRefSet(fixture.refSetField).$set,
        };
    }

    it('does not throw, and encodes the incoming entries as object ids', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const first = new gameObjectHelper.TestGameObject(game, 'first');
        const second = new gameObjectHelper.TestGameObject(game, 'second');

        expect(() => {
            fixture.refMapField = new Map([['a', first], ['b', second]]);
            fixture.refSetField = new Set([first, second]);
        }).not.toThrow();

        expect([...fixture.refMapField.entries()]).toEqual([['a', first], ['b', second]]);
        expect([...fixture.refSetField]).toEqual([first, second]);

        const { mapIds, setIds } = idsOf(fixture);
        expect(mapIds).toEqual([['a', first.getObjectId()], ['b', second.getObjectId()]]);
        expect(setIds).toEqual([first.getObjectId(), second.getObjectId()]);
    });

    it('keeps encoding mutations made after such an assignment', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const first = new gameObjectHelper.TestGameObject(game, 'first');
        const second = new gameObjectHelper.TestGameObject(game, 'second');

        fixture.refMapField = new Map([['a', first]]);
        fixture.refSetField = new Set([first]);

        fixture.refMapField.set('b', second);
        fixture.refSetField.add(second);

        let encoded = idsOf(fixture);
        expect(encoded.mapIds).toEqual([['a', first.getObjectId()], ['b', second.getObjectId()]]);
        expect(encoded.setIds).toEqual([first.getObjectId(), second.getObjectId()]);

        fixture.refMapField.delete('a');
        fixture.refSetField.delete(first);

        encoded = idsOf(fixture);
        expect(encoded.mapIds).toEqual([['b', second.getObjectId()]]);
        expect(encoded.setIds).toEqual([second.getObjectId()]);

        fixture.refMapField.clear();
        fixture.refSetField.clear();

        encoded = idsOf(fixture);
        expect(encoded.mapIds).toEqual([]);
        expect(encoded.setIds).toEqual([]);
    });

    it('still accepts an empty collection, the only shape the engine assigns today', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const first = new gameObjectHelper.TestGameObject(game, 'first');

        expect(() => {
            fixture.refMapField = new Map();
            fixture.refSetField = new Set();
        }).not.toThrow();

        expect(fixture.refMapField.size).toBe(0);
        expect(fixture.refSetField.size).toBe(0);

        fixture.refMapField.set('a', first);
        fixture.refSetField.add(first);

        const { mapIds, setIds } = idsOf(fixture);
        expect(mapIds).toEqual([['a', first.getObjectId()]]);
        expect(setIds).toEqual([first.getObjectId()]);
    });
});

/**
 * `P3-PA4` (PA4-IR-1 fix-pass): registeredStateClassesByName is a process-wide registry keyed by bare
 * class name, so a second @registerState/@registerStateBase class declared with a name that collides
 * with an already-registered one (here, the top-of-file `JsonSafeStateValueFixture` fixture) must throw
 * at decoration time rather than silently overwrite the earlier registration.
 */
describe('the @registerState duplicate class name guard', function() {
    it('throws when a class name collides with an already-registered class', function() {
        const declareDuplicate = () => {
            @registerState()
            class JsonSafeStateValueFixture extends GameObjectBase {
                @statePrimitive() public accessor other: string = 'x';
            }
            return JsonSafeStateValueFixture;
        };

        expect(declareDuplicate).toThrowError(/JsonSafeStateValueFixture.*already registered/);
    });

    /**
     * `P3-PA4` (PA4-IR2-1 fix-pass, round 2): the concrete-branch-only guard above did not cover
     * `@registerStateBase()`, so a top-level single-declaration fragment like the real `ZoneAbstract`
     * (round 2's named falsifier) could be silently shadowed by a same-named class with different fields.
     */
    it('throws when a top-level (non-factory-declared) @registerStateBase class name collides with an already-registered class of a different field shape', function() {
        // Precondition: the original fixture is actually registered, with the one field this duplicate will lack
        // (plus GameObjectBase's own `_uuid`, since the model is the flattened prototype-chain walk).
        const registeredFieldNames = getRuntimeStateFieldModelByClassName('TopLevelBaseFixture')?.map((field) => field.name)
            .sort();
        expect(registeredFieldNames).toEqual(['_uuid', 'topLevelField']);

        const declareDuplicate = () => {
            @registerStateBase()
            abstract class TopLevelBaseFixture extends GameObjectBase {
                @statePrimitive() public accessor differentField: string = 'x';
            }
            return TopLevelBaseFixture;
        };

        expect(declareDuplicate).toThrowError(/TopLevelBaseFixture.*already registered.*different field shape/);
    });

    /**
     * `P3-PA4` (PA4-IR2-1 fix-pass, round 2): the guard must NOT throw on the legitimate case it was
     * originally left unguarded to allow - a factory-declared fragment (like the real `AsLeader`) that is
     * re-declared, under the same name, once per call site, against a different base class each time.
     */
    it('does not throw when a factory-declared @registerStateBase fragment (like AsLeader) is legitimately re-registered from a different call site with identical own fields', function() {
        const firstCallSite = WithRepeatableFragment(BaseVariantAFixture);

        // Precondition: the first call site is actually registered, with its own field plus its base's
        // (and GameObjectBase's own `_uuid`, since the model is the flattened prototype-chain walk).
        const firstCallSiteFieldNames = getRuntimeStateFieldModelByClassName('RepeatableFragment')?.map((field) => field.name)
            .sort();
        expect(firstCallSiteFieldNames).toEqual(['_uuid', 'repeatableField', 'variantAField']);

        let secondCallSite: unknown;
        expect(() => {
            secondCallSite = WithRepeatableFragment(BaseVariantBFixture);
        }).not.toThrow();

        expect(secondCallSite).not.toBe(firstCallSite);
        // The flattened model now reflects the second call site's base class - legitimately different from
        // the first call's flattened model - which is exactly why the guard compares each class's *own*
        // field metadata rather than this flattened one.
        const secondCallSiteFieldNames = getRuntimeStateFieldModelByClassName('RepeatableFragment')?.map((field) => field.name)
            .sort();
        expect(secondCallSiteFieldNames).toEqual(['_uuid', 'repeatableField', 'variantBField']);
    });
});

describe('getRuntimeStateFieldModelByClassName', function() {
    it('returns undefined for a class name that was never registered', function() {
        expect(getRuntimeStateFieldModelByClassName('SomeClassNameThatWasNeverRegistered')).toBeUndefined();
    });

    it('distinguishes @statePrimitive and @stateValue fields on the same class as kind "primitive" and "value" respectively, and maps each ref-shaped decorator to its expected kind', function() {
        const fields = getRuntimeStateFieldModelByClassName('AllFieldKindsFixture');
        expect(fields).toBeDefined();

        const byName = new Map(fields.map((field) => [field.name, field.kind]));
        expect(byName.get('primitiveField')).toBe('primitive');
        expect(byName.get('valueField')).toBe('value');
        expect(byName.get('refField')).toBe('ref');
        expect(byName.get('refArrayField')).toBe('refArray');
        expect(byName.get('refMapField')).toBe('refMap');
        expect(byName.get('refSetField')).toBe('refSet');
        expect(byName.get('refRecordField')).toBe('refRecord');
    });

    it('includes a factory-declared @registerStateBase intermediate\'s own field in its @registerState concrete descendant\'s flattened model', function() {
        const fields = getRuntimeStateFieldModelByClassName('ConcreteFragmentDescendantFixture');
        expect(fields).toBeDefined();

        const byName = new Map(fields.map((field) => [field.name, field.kind]));
        expect(byName.get('fragmentField')).toBe('primitive');
        expect(byName.get('concreteField')).toBe('primitive');
    });
});

/**
 * `P3-PB2` (`PB2-C4`): eager ref marking. Before the state-bag cutover every `_hasRef` latch was an
 * incidental side effect of building the id mirror; with the mirror deleted, `markStateRef*` is the only
 * thing that latches, and a dropped latch neither fails to compile nor reliably fails a gameplay test -
 * the referent is culled at the *next* snapshot and the rollback after that dies in `getFromUuidUnsafe`.
 * Each path below writes a referent that is reachable *only* through the field under test, so `hasRef`
 * going false is a direct, local falsifier for that path.
 */
describe('P3-PB2 eager ref marking (PB2-C4)', function() {
    function freshReferent() {
        const { game } = gameObjectHelper.createMockGame();
        return { game, referent: new gameObjectHelper.TestGameObject(game, 'referent') };
    }

    it('latches through the @stateRef setter', function() {
        const { game, referent } = freshReferent();
        const fixture = new AllFieldKindsFixture(game);
        expect(referent.hasRef).toBe(false);

        fixture.refField = referent;

        expect(referent.hasRef).toBe(true);
    });

    it('latches through the readonly @stateRefArray setter', function() {
        const { game, referent } = freshReferent();
        const fixture = new AllFieldKindsFixture(game);
        expect(referent.hasRef).toBe(false);

        fixture.refArrayField = [referent];

        expect(referent.hasRef).toBe(true);
    });

    it('latches through the mutable @stateRefArray setter', function() {
        const { game, referent } = freshReferent();
        const fixture = new CutoverMarkingFixture(game);
        expect(referent.hasRef).toBe(false);

        fixture.mutableRefArrayField = [referent] as unknown as IStateArray<GameObjectBase>;

        expect(referent.hasRef).toBe(true);
        // The deliberate P3-PB2 `init`/`set` change: the wrapper must actually hold the assigned contents
        // now that it is the only storage.
        expect(fixture.mutableRefArrayField.length).toBe(1);
        expect(fixture.mutableRefArrayField[0]).toBe(referent);
        expect(fixture.mutableRefArrayField.constructor.name).toBe('UndoArray');
    });

    it('latches through UndoArray.push and UndoArray.unshift', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new CutoverMarkingFixture(game);
        const pushed = new gameObjectHelper.TestGameObject(game, 'pushed');
        const unshifted = new gameObjectHelper.TestGameObject(game, 'unshifted');
        expect(pushed.hasRef).toBe(false);
        expect(unshifted.hasRef).toBe(false);

        const live = fixture.mutableRefArrayField as unknown as GameObjectBase[];
        live.push(pushed);
        live.unshift(unshifted);

        expect(pushed.hasRef).toBe(true);
        expect(unshifted.hasRef).toBe(true);
    });

    it('latches through the @stateRefMap setter and UndoMap.set', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const assigned = new gameObjectHelper.TestGameObject(game, 'assigned');
        const added = new gameObjectHelper.TestGameObject(game, 'added');

        fixture.refMapField = new Map([['a', assigned as unknown as GameObjectBase]]);
        expect(assigned.hasRef).toBe(true);

        expect(added.hasRef).toBe(false);
        fixture.refMapField.set('b', added as unknown as GameObjectBase);
        expect(added.hasRef).toBe(true);
    });

    it('latches through the @stateRefSet setter and UndoSet.add', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const assigned = new gameObjectHelper.TestGameObject(game, 'assigned');
        const added = new gameObjectHelper.TestGameObject(game, 'added');

        fixture.refSetField = new Set([assigned as unknown as GameObjectBase]);
        expect(assigned.hasRef).toBe(true);

        expect(added.hasRef).toBe(false);
        fixture.refSetField.add(added as unknown as GameObjectBase);
        expect(added.hasRef).toBe(true);
    });

    it('latches through the @stateRefRecord setter and the proxy set trap', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);
        const assigned = new gameObjectHelper.TestGameObject(game, 'assigned');
        const trapped = new gameObjectHelper.TestGameObject(game, 'trapped');

        fixture.refRecordField = { a: assigned as unknown as GameObjectBase };
        expect(assigned.hasRef).toBe(true);

        expect(trapped.hasRef).toBe(false);
        fixture.refRecordField.b = trapped as unknown as GameObjectBase;
        expect(trapped.hasRef).toBe(true);
    });

    /** Closes the `P3-PA1` landmine: `stateRefRecord`'s `set` had no null guard and reached `new Proxy(null)`. */
    it('accepts null through the @stateRefRecord setter without throwing', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new AllFieldKindsFixture(game);

        expect(() => {
            fixture.refRecordField = null as unknown as Record<string, GameObjectBase>;
        }).not.toThrow();
        expect(fixture.refRecordField).toBeNull();
    });
});

/**
 * `P3-PA2` asked P3-PB2 to add this: primitive parity used to be true *by construction*, because both
 * comparison legs read the same state-bag slot. After the cutover a `@statePrimitive` value lives in the
 * native backing field and travels through a record, so signed zero and the non-finite values (which
 * `@statePrimitive` has no assert against, and which are therefore representable today) have to be shown
 * to survive that trip rather than assumed to.
 *
 * Scope, stated honestly (P3-PB2 fix, `PB2I1-CS-06`). What these cases establish is the **accessor**
 * half: the decorated `@statePrimitive` get/set pair stores and returns `-0`, `NaN` and `±Infinity`
 * unmangled. The record hop below is hand-modelled, not executed - `{ f: instance.f }` / `instance.f = r.f`
 * reduces to `Object.is(x, x)` and cannot go red - and it is kept only as a shape pin showing what the
 * generated code for this kind looks like: `fieldEncodeExpr`'s `primitive` branch emits a bare accessor
 * read and `fieldDecodeExpr`'s a bare assignment, with no encoder in between.
 *
 * Driving a real generated serializer instead would need a *server*-tree class carrying a numeric
 * `@statePrimitive` and constructible from a mock game, and that is what makes the substitution
 * non-trivial: the generator's registry is built from `server/` only, so this file's `@registerState`
 * fixture has no entry, and the swap is a new server-tree fixture rather than a changed line here. (The
 * obvious candidate, a unit card's `_damage`, would additionally cover only half the values under test -
 * its public write path `setDamageForStateInjection` asserts `Contract.assertNonNegative`, which rejects
 * `NaN` and `-Infinity` but admits `Infinity` and `-0`; the `protected set damage` path used by
 * `addDamage`/`removeDamage` asserts nothing numeric at all.) Left as a deliberate residual; the underlying
 * property is not in doubt, because a bare accessor read means the value never meets a codec.
 */
describe('P3-PB2 @statePrimitive non-finite and signed-zero accessor storage', function() {
    for (const value of [NaN, Infinity, -Infinity, -0]) {
        it(`stores and returns ${Object.is(value, -0) ? '-0' : String(value)} unmangled through the decorated accessor`, function() {
            const { game } = gameObjectHelper.createMockGame();
            const fixture = new CutoverMarkingFixture(game);

            fixture.numberField = value;
            expect(Object.is(fixture.numberField, value)).toBe(true);

            // Shape pin only, per the block comment: this is the literal production shape for a `primitive`
            // field, but it exercises no generated code and cannot fail on its own.
            const record = { numberField: fixture.numberField };
            fixture.numberField = 7;
            expect(Object.is(fixture.numberField, 7)).toBe(true);
            fixture.numberField = record.numberField;

            expect(Object.is(fixture.numberField, value)).toBe(true);
        });
    }
});
