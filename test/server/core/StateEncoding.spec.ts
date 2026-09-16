import {
    decodeRef,
    decodeRefArray,
    decodeRefMap,
    decodeRefRecord,
    decodeRefSet,
    decodeStateValue,
    encodeRef,
    encodeRefArray,
    encodeRefMap,
    encodeRefRecord,
    encodeRefSet,
    encodeStateValue,
    STATE_ENCODING_TAGS
} from '../../../server/game/core/StateEncoding';
import type { IGameObjectBase } from '../../../server/game/core/GameObjectBase';

/** Minimal ref-kind fixture. `getObjectId` throws so any accidental call is caught by AC2's specs. */
function makeRef(uuid: string): IGameObjectBase {
    return {
        uuid,
        getObjectId: () => {
            throw new Error(`getObjectId() should never be called by an encoder (uuid: ${uuid})`);
        }
    } as unknown as IGameObjectBase;
}

/** Minimal Game stub sufficient for decodeRef's lookup. */
function makeGameStub(byUuid: Map<string, IGameObjectBase>) {
    return {
        getFromUuidUnsafe: (uuid: string) => byUuid.get(uuid) ?? null
    } as unknown as import('../../../server/game/core/Game').Game;
}

describe('StateEncoding value encoder/decoder', function() {
    it('round-trips a nested object holding an array holding a Map<string, string[]> and a Set<number>', function() {
        const value = {
            list: [
                new Map<string, string[]>([['a', ['x', 'y']], ['b', []]]),
                new Set<number>([1, 2, 3])
            ]
        };

        const record = encodeStateValue('field', value);
        expect(record).toEqual({
            list: [
                { $map: [['a', ['x', 'y']], ['b', []]] },
                { $set: [1, 2, 3] }
            ]
        });

        const decoded = decodeStateValue(record) as typeof value;
        expect(decoded.list[0]).toEqual(value.list[0]);
        expect(decoded.list[1]).toEqual(value.list[1]);
    });

    it('round-trips a Map whose values are themselves tagged (a Map of Maps and Sets)', function() {
        const value = new Map<string, Map<string, number> | Set<number>>([
            ['a', new Map<string, number>([['x', 1]])],
            ['b', new Set<number>([1])]
        ]);

        const record = encodeStateValue('field', value);
        expect(record).toEqual({
            $map: [
                ['a', { $map: [['x', 1]] }],
                ['b', { $set: [1] }]
            ]
        });

        const roundTripped = JSON.parse(JSON.stringify(record)) as typeof record;
        const decoded = decodeStateValue(roundTripped) as typeof value;
        expect(decoded).toEqual(value);
        expect(decoded).toBeInstanceOf(Map);
        expect(decoded.get('a')).toBeInstanceOf(Map);
        expect(decoded.get('b')).toBeInstanceOf(Set);
    });

    it('does not alias the source into the record: mutating the source after encoding leaves the record unchanged', function() {
        const map = new Map<string, number>([['a', 1]]);
        const source = { map };

        const record = encodeStateValue('field', source) as { map: { $map: [string, number][] } };
        map.set('b', 2);

        expect(record.map.$map).toEqual([['a', 1]]);
    });

    it('does not alias the record into decoded values: two decodes are independent and mutating one leaves the record and the other decode unchanged', function() {
        const record = { $map: [['a', 1]] };

        const first = decodeStateValue(record) as Map<string, number>;
        const second = decodeStateValue(record) as Map<string, number>;
        first.set('b', 2);

        expect(second.has('b')).toBe(false);
        expect(record.$map).toEqual([['a', 1]]);
    });

    describe('throws on values outside the value encoder domain, naming the field path', function() {
        it('a function', function() {
            expect(() => encodeStateValue('root.fn', () => 1)).toThrowError(/root\.fn/);
        });

        it('a symbol', function() {
            expect(() => encodeStateValue('root.sym', Symbol('x'))).toThrowError(/root\.sym/);
        });

        it('a bigint', function() {
            expect(() => encodeStateValue('root.big', 1n)).toThrowError(/root\.big/);
        });

        it('a Date', function() {
            expect(() => encodeStateValue('root.date', new Date())).toThrowError(/root\.date/);
        });

        it('a class instance with a foreign prototype', function() {
            class Foreign {
                public marker = true;
            }
            expect(() => encodeStateValue('root.foreign', new Foreign())).toThrowError(/root\.foreign/);
        });

        it('an object exposing getObjectId (a GameObjectBase-shaped instance)', function() {
            expect(() => encodeStateValue('root.go', makeRef('uuid-1'))).toThrowError(/root\.go/);
        });

        it('a cycle', function() {
            const cyclic: Record<string, unknown> = {};
            cyclic.self = cyclic;
            expect(() => encodeStateValue('root.cyc', cyclic)).toThrowError(/root\.cyc/);
        });

        it('a Map with a non-string key', function() {
            const map = new Map<unknown, unknown>([[1, 'a']]);
            expect(() => encodeStateValue('root.map', map)).toThrowError(/root\.map/);
        });

        for (const tag of ['$map', '$set', '$num']) {
            it(`a plain object carrying "${tag}" as an own key`, function() {
                expect(() => encodeStateValue('root.obj', { [tag]: 1 })).toThrowError(/root\.obj/);
            });
        }

        it('an undefined array element', function() {
            expect(() => encodeStateValue('root.arr', [1, undefined, 3])).toThrowError(/root\.arr\[1\]/);
        });

        it('an undefined Map value', function() {
            const map = new Map<string, unknown>([['a', undefined]]);
            expect(() => encodeStateValue('root.map', map)).toThrowError(/root\.map/);
        });

        it('an undefined Set member', function() {
            const set = new Set<unknown>([undefined]);
            expect(() => encodeStateValue('root.set', set)).toThrowError(/root\.set/);
        });

        it('a non-finite number inside a value payload', function() {
            expect(() => encodeStateValue('root.num', { n: NaN })).toThrowError(/root\.num\.n/);
            expect(() => encodeStateValue('root.inf', Infinity)).toThrowError(/root\.inf/);
        });
    });

    it('the value path throws on a non-finite number, and $num remains reserved in the tag vocabulary for the primitive path', function() {
        // The primitive kind has no encoder function at all (see StateEncoding.ts's doc comment and the
        // generator's fieldEncodeExpr): a generated serialize<Class> assigns record[field] = instance[field]
        // directly, so a non-finite number already representable in @statePrimitive today survives untouched
        // (exercised end-to-end by GeneratedStateSerializers.spec.ts's real-record JSON round trip). $num is
        // reserved here so decodeStateValue can recognize and reject it explicitly rather than silently
        // falling through, once Plan 6 assigns it a decode branch.
        expect(() => encodeStateValue('field', NaN)).toThrow();
        expect(STATE_ENCODING_TAGS).toContain('$num');
    });

    it('survives an undefined object property value through encode/decode unchanged', function() {
        const record = encodeStateValue('field', { a: 1, b: undefined }) as Record<string, unknown>;
        expect(record.a).toBe(1);
        expect('b' in record).toBe(true);
        expect(record.b).toBeUndefined();

        const decoded = decodeStateValue(record) as Record<string, unknown>;
        expect(decoded.b).toBeUndefined();
    });

    it('does not collapse a null collection and an empty collection', function() {
        expect(encodeStateValue('field', null)).toBeNull();
        expect(encodeStateValue('field', new Map())).toEqual({ $map: [] });
        expect(encodeStateValue('field', new Set())).toEqual({ $set: [] });
    });

    describe('decode validates tag payload shape rather than trusting it, closing the encode/decode asymmetry', function() {
        it('throws on a tagged object carrying a second own key alongside $map', function() {
            expect(() => decodeStateValue({ $map: [['a', 1]], extra: 'x' })).toThrowError(/exactly one own key/);
        });

        it('throws on a tagged object carrying a second own key alongside $set', function() {
            expect(() => decodeStateValue({ $set: [1], extra: 'x' })).toThrowError(/exactly one own key/);
        });

        it('throws when $map is not an array', function() {
            expect(() => decodeStateValue({ $map: 'ab' })).toThrowError(/"\$map" must be an array/);
        });

        it('throws when a $map entry is not a two-element [string, unknown] pair', function() {
            expect(() => decodeStateValue({ $map: [['a', 1, 2]] })).toThrowError(/two-element \[string, unknown\] pair/);
            expect(() => decodeStateValue({ $map: [[1, 'a']] })).toThrowError(/two-element \[string, unknown\] pair/);
            expect(() => decodeStateValue({ $map: ['a'] })).toThrowError(/two-element \[string, unknown\] pair/);
        });

        it('throws when $set is not an array', function() {
            expect(() => decodeStateValue({ $set: 'ab' })).toThrowError(/"\$set" must be an array/);
        });

        it('throws on a reserved tag with no decode branch ($num) instead of silently returning a plain object', function() {
            expect(() => decodeStateValue({ $num: 'NaN' })).toThrowError(/reserved tag "\$num" has no decode branch/);
        });
    });
});

describe('StateEncoding ref-kind encoders/decoders', function() {
    it('encodeRef reads uuid directly and never calls getObjectId', function() {
        const ref = makeRef('uuid-1');
        expect(encodeRef(ref)).toBe('uuid-1');
    });

    it('encodeRefArray, encodeRefMap, encodeRefSet, and encodeRefRecord all read uuid directly and never call getObjectId', function() {
        const a = makeRef('a');
        const b = makeRef('b');

        expect(encodeRefArray([a, b])).toEqual(['a', 'b']);
        expect(encodeRefMap(new Map([['k1', a], ['k2', b]]))).toEqual({ $map: [['k1', 'a'], ['k2', 'b']] });
        expect(encodeRefSet(new Set([a, b]))).toEqual({ $set: ['a', 'b'] });
        expect(encodeRefRecord({ k1: a, k2: b })).toEqual({ k1: 'a', k2: 'b' });
    });

    it('every ref kind encodes null/undefined to null', function() {
        expect(encodeRef(null)).toBeNull();
        expect(encodeRef(undefined)).toBeNull();
        expect(encodeRefArray(null)).toBeNull();
        expect(encodeRefMap(null)).toBeNull();
        expect(encodeRefSet(null)).toBeNull();
        expect(encodeRefRecord(null)).toBeNull();
    });

    it('decodeRef resolves through game.getFromUuidUnsafe and returns null for a null id', function() {
        const target = makeRef('uuid-1');
        const game = makeGameStub(new Map([['uuid-1', target]]));

        expect(decodeRef(game, 'uuid-1')).toBe(target);
        expect(decodeRef(game, null)).toBeNull();
    });

    it('populated round trip: a non-null refSet encodes to a tagged array and decodes back to a Set of the resolved live objects', function() {
        const a = makeRef('a');
        const b = makeRef('b');
        const game = makeGameStub(new Map([['a', a], ['b', b]]));

        const encoded = encodeRefSet(new Set([a, b]));
        expect(encoded).toEqual({ $set: ['a', 'b'] });

        const decoded = decodeRefSet(game, encoded);
        expect(decoded).toEqual(new Set([a, b]));
    });

    it('populated round trip: a non-null refRecord encodes to a plain uuid record and decodes back to a record of the resolved live objects', function() {
        const a = makeRef('a');
        const b = makeRef('b');
        const game = makeGameStub(new Map([['a', a], ['b', b]]));

        const encoded = encodeRefRecord({ k1: a, k2: b });
        expect(encoded).toEqual({ k1: 'a', k2: 'b' });

        const decoded = decodeRefRecord(game, encoded);
        expect(decoded).toEqual({ k1: a, k2: b });
    });

    it('decodeRefArray and decodeRefMap resolve every entry through game.getFromUuidUnsafe', function() {
        const a = makeRef('a');
        const b = makeRef('b');
        const game = makeGameStub(new Map([['a', a], ['b', b]]));

        expect(decodeRefArray(game, ['a', 'b'])).toEqual([a, b]);
        expect(decodeRefMap(game, { $map: [['k1', 'a'], ['k2', 'b']] })).toEqual(new Map([['k1', a], ['k2', b]]));
    });
});
