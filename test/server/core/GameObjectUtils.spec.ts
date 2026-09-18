import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
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
