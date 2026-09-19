import * as v8 from 'v8';
import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import type { IGameObjectBaseState } from '../../../server/game/core/GameObjectBase';
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

interface IValueCollectionFieldsFixtureState extends IGameObjectBaseState {
    mapField: Map<string, number>;
    setField: Set<number>;
    arrayField: string[];
}

/**
 * `P3-PB1` (AC2-AC6): a fixture carrying one field of each of the three new value-collection decorators.
 * `state` is redeclared with its own interface so tests can read `getStateUnsafe()`/build `setState()`
 * arguments with the real field names, the same pattern `AbilityLimit.ts`'s `IAbilityLimitState` uses.
 */
@registerState()
class ValueCollectionFieldsFixture extends GameObjectBase {
    public declare state: IValueCollectionFieldsFixtureState;

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
     * D3 / AC3: the direct, executable regression guard for the ValueArray sparse-construction defect found
     * in v1 (`new ValueArray().init(...)`; `.length =`; index-assign produced a measured +7-9% larger
     * serialization). Exact byte equality, not merely equal length or content.
     */
    it('serializes to byte-identical output as the same bag holding a plain, unwrapped Map/Set/Array (snapshot byte-parity)', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);
        fixture.mapField.set('a', 1);
        fixture.mapField.set('b', 2);
        fixture.setField.add(1);
        fixture.setField.add(2);
        fixture.arrayField.push('x', 'y', 'z');

        const wrappedBag = fixture.getStateUnsafe() as unknown as IValueCollectionFieldsFixtureState;

        const plainMapBag = { ...wrappedBag, mapField: new Map(wrappedBag.mapField.entries()) };
        const plainSetBag = { ...wrappedBag, setField: new Set(wrappedBag.setField.values()) };
        const plainArrayBag = { ...wrappedBag, arrayField: [...wrappedBag.arrayField] };

        expect(Buffer.compare(v8.serialize(wrappedBag), v8.serialize(plainMapBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(wrappedBag), v8.serialize(plainSetBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(wrappedBag), v8.serialize(plainArrayBag))).toBe(0);
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

        // Capture strictly before the second mutation below.
        const buf = v8.serialize(fixture.getStateUnsafe());

        fixture.mapField.set('b', 2);
        expect(fixture.mapField.size).toBe(2);

        // Restore from the captured buffer, not a live reference.
        fixture.setState(v8.deserialize(buf) as IValueCollectionFieldsFixtureState);

        expect([...fixture.mapField.entries()]).toEqual([['a', 1]]);
        expect(fixture.mapField instanceof ValueMap).toBe(true);
    });

    /**
     * PB1-R3: the byte-parity test above only ever constructs `ValueSet`/`ValueArray` from an empty default
     * then mutates in place natively; the reassignment test above asserts only `toEqual`, not byte identity.
     * Neither combines "construct from a non-empty input via whole-field reassignment or a setState/rollback
     * restore" with a `Buffer.compare` assertion, so a future change that special-cased the empty-construction
     * path (the way the v1 `new ValueArray().init(...)` + index-assign defect did for `ValueArray` alone)
     * would not be caught for `ValueSet`/`ValueArray` here. This exercises both: reassignment to a non-empty
     * native collection, and a setState restore of a non-empty captured buffer, for every wrapped type.
     */
    it('serializes to byte-identical output when a @stateMap/@stateSet/@stateArray field is (re)constructed from non-empty input, via reassignment or a setState restore', function() {
        const { game } = gameObjectHelper.createMockGame();
        const fixture = new ValueCollectionFieldsFixture(game);

        // Reassignment path: the wrapping constructor call (ValueMap/ValueSet/CreateValueArrayInternal) runs
        // against a non-empty native Map/Set/Array, not the empty default this unit's own fixture starts from.
        fixture.mapField = new Map([['a', 1], ['b', 2]]);
        fixture.setField = new Set([1, 2, 3]);
        fixture.arrayField = ['x', 'y', 'z'];

        const reassignedBag = fixture.getStateUnsafe() as unknown as IValueCollectionFieldsFixtureState;
        const reassignedPlainMapBag = { ...reassignedBag, mapField: new Map(reassignedBag.mapField.entries()) };
        const reassignedPlainSetBag = { ...reassignedBag, setField: new Set(reassignedBag.setField.values()) };
        const reassignedPlainArrayBag = { ...reassignedBag, arrayField: [...reassignedBag.arrayField] };

        expect(Buffer.compare(v8.serialize(reassignedBag), v8.serialize(reassignedPlainMapBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(reassignedBag), v8.serialize(reassignedPlainSetBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(reassignedBag), v8.serialize(reassignedPlainArrayBag))).toBe(0);

        // setState restore path: copyState's full-field reassignment re-enters the accessor's setter with a
        // deserialized (non-empty) plain Map/Set/Array, exercising the same wrapping constructors again.
        const buf = v8.serialize(fixture.getStateUnsafe());
        fixture.mapField.set('c', 3);
        fixture.setField.add(4);
        fixture.arrayField.push('w');
        fixture.setState(v8.deserialize(buf) as IValueCollectionFieldsFixtureState);

        const restoredBag = fixture.getStateUnsafe() as unknown as IValueCollectionFieldsFixtureState;
        const restoredPlainMapBag = { ...restoredBag, mapField: new Map(restoredBag.mapField.entries()) };
        const restoredPlainSetBag = { ...restoredBag, setField: new Set(restoredBag.setField.values()) };
        const restoredPlainArrayBag = { ...restoredBag, arrayField: [...restoredBag.arrayField] };

        expect(Buffer.compare(v8.serialize(restoredBag), v8.serialize(restoredPlainMapBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(restoredBag), v8.serialize(restoredPlainSetBag))).toBe(0);
        expect(Buffer.compare(v8.serialize(restoredBag), v8.serialize(restoredPlainArrayBag))).toBe(0);
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
