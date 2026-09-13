import { GameObjectBase } from '../../../server/game/core/GameObjectBase';
import { assertJsonSafeStateValue, registerState, stateValue } from '../../../server/game/core/GameObjectUtils';

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
