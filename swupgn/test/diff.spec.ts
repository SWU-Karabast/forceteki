import * as writerEntry from '../src/writer';
import { diff } from '../src/writer/diff';
import { apply, applyRecord, cloneBoard, emptyBoard } from '../src/apply';
import { serialize } from '../src/serialize';
import { SwuPgnError } from '../src/errors';
import { canonicalAttrNames } from '../src/attrOrder';
import { boardPairs } from './helpers/boards';
import type { Board, SwuRecord } from '../src/generated/types';

function board(entities: Board['entities']): Board {
    return { seq: null, entities: { g: { a: {} }, p1: { a: {} }, p2: { a: {} }, ...entities } };
}

function applied(prev: Board, records: SwuRecord[]): Board {
    const b = cloneBoard(prev);
    for (const r of records) {
        applyRecord(b, r);
    }
    return b;
}

function expectRecords(actual: SwuRecord[], expected: unknown[]): void {
    expect(actual as unknown[]).toEqual(expected);
}

const KEY_ORDER = ['t', 'e', 'zone', 'owner', 'controller', 'parent', 'rel', 'card', 'to', 'a'];

function codeOf(fn: () => unknown): string | undefined {
    try {
        fn();
    } catch (e) {
        if (e instanceof SwuPgnError) {
            return e.code;
        }
        throw e;
    }
    return undefined;
}

describe('diff', () => {
    it('apply(prev, diff(prev, next)) deep-equals next', () => {
        const pairs = boardPairs(20261103, 500);
        expect(pairs.length).toBe(500);
        let withRecords = 0;
        pairs.forEach(({ prev, next }, i) => {
            const records = diff(prev, next);
            withRecords += records.length > 0 ? 1 : 0;
            const got = applied(prev, records);
            expect(got.entities).withContext('pair ' + i)
                .toEqual(next.entities);
            // JSON key order is canonical, and survives a re-serialize
            for (const r of records) {
                const keys = Object.keys(r);
                expect(keys).toEqual(KEY_ORDER.filter((k) => keys.includes(k)).concat(keys.filter((k) => !KEY_ORDER.includes(k))));
                const a = (r as { a?: Record<string, unknown> }).a;
                if (a) {
                    expect(Object.keys(a)).toEqual(canonicalAttrNames(Object.keys(a)));
                }
            }
        });
        expect(withRecords).toBeGreaterThan(400);
    });

    it('apply of a diff from the empty board rebuilds the board', () => {
        const next = board({ 1: { zone: 'ground', owner: 1, a: { damage: 1 } }, 2: { zone: 'ground', owner: 1, parent: 1, rel: 'attached', a: {} } });
        expect(applied(emptyBoard(), diff(emptyBoard(), next)).entities).toEqual(next.entities);
    });

    it('empty diff for equal boards', () => {
        const b = board({ 1: { zone: 'hand', owner: 1, card: 'SOR#001', to: [1], a: { damage: 2 } } });
        expect(diff(b, JSON.parse(JSON.stringify(b)))).toEqual([]);
    });

    it('emits a parent before its child in creates', () => {
        // the child has the lower id, so id order alone would put it first
        const next = board({
            1: { zone: 'ground', owner: 1, parent: 2, rel: 'attached', a: {} },
            2: { zone: 'ground', owner: 1, a: {} },
        });
        const records = diff(board({}), next);
        expect(records.map((r) => (r as { e: number }).e)).toEqual([2, 1]);
        expect(records.map((r) => r.t)).toEqual(['create', 'create']);
    });

    it('deleted attribute becomes null', () => {
        const prev = board({ 1: { zone: 'ground', owner: 1, a: { damage: 2, exhausted: true } } });
        const next = board({ 1: { zone: 'ground', owner: 1, a: { exhausted: true } } });
        expectRecords(diff(prev, next), [{ t: 'set', e: 1, a: { damage: null } }]);
    });

    it('orders creates, reveals, sets, removes, with children removed before their parent', () => {
        const prev = board({
            1: { zone: 'ground', owner: 1, a: {} },
            2: { zone: 'ground', owner: 1, parent: 1, rel: 'attached', a: {} },
            3: { zone: 'hand', owner: 1, card: 'SOR#001', to: [1], a: {} },
        });
        const next = board({
            3: { zone: 'ground', owner: 1, card: 'SOR#001', to: 'all', a: {} },
            4: { zone: 'ground', owner: 2, a: {} },
        });
        expectRecords(diff(prev, next), [
            { t: 'create', e: 4, zone: 'ground', owner: 2 },
            { t: 'reveal', e: 3, card: 'SOR#001', to: 'all' },
            { t: 'set', e: 3, zone: 'ground' },
            { t: 'remove', e: 2 },
            { t: 'remove', e: 1 },
        ]);
    });

    it('a set that carries parent also carries rel; detaching carries rel null', () => {
        const prev = board({
            1: { zone: 'ground', owner: 1, a: {} },
            2: { zone: 'ground', owner: 1, a: {} },
            3: { zone: 'ground', owner: 1, parent: 1, rel: 'attached', a: {} },
        });
        const moved = board({ ...prev.entities, 3: { zone: 'ground', owner: 1, parent: 2, rel: 'attached', a: {} } });
        expectRecords(diff(prev, moved), [{ t: 'set', e: 3, parent: 2, rel: 'attached' }]);
        const relChanged = board({ ...prev.entities, 3: { zone: 'ground', owner: 1, parent: 1, rel: 'pilot', a: {} } });
        expectRecords(diff(prev, relChanged), [{ t: 'set', e: 3, parent: 1, rel: 'pilot' }]);
        const detached = board({ ...prev.entities, 3: { zone: 'discard', owner: 1, a: {} } });
        expectRecords(diff(prev, detached), [{ t: 'set', e: 3, zone: 'discard', parent: null, rel: null }]);
    });

    it('re-parenting onto a new entity comes after its create', () => {
        const prev = board({ 1: { zone: 'ground', owner: 1, a: {} }, 2: { zone: 'ground', owner: 1, parent: 1, rel: 'attached', a: {} } });
        const next = board({ 1: { zone: 'ground', owner: 1, a: {} }, 2: { zone: 'ground', owner: 1, parent: 3, rel: 'attached', a: {} }, 3: { zone: 'ground', owner: 1, a: {} } });
        expect(diff(prev, next).map((r) => r.t)).toEqual(['create', 'set']);
    });

    it('controller removal is null; g/p1/p2 attributes are sets without fixed fields', () => {
        const prev = board({ 1: { zone: 'ground', owner: 1, controller: 2, a: {} } });
        prev.entities.p1.a = { credits: 2 };
        const next = board({ 1: { zone: 'ground', owner: 1, a: {} } });
        next.entities.g.a = { round: 2 };
        expectRecords(diff(prev, next), [
            { t: 'set', e: 'g', a: { round: 2 } },
            { t: 'set', e: 'p1', a: { credits: null } },
            { t: 'set', e: 1, controller: null },
        ]);
    });

    it('reveal to is the seats added; a card gained is revealed', () => {
        const prev = board({
            1: { zone: 'hand', owner: 1, card: 'SOR#001', to: [1], a: {} },
            2: { zone: 'hand', owner: 1, a: {} },
        });
        const next = board({
            1: { zone: 'hand', owner: 1, card: 'SOR#001', to: [1, 2], a: {} },
            2: { zone: 'hand', owner: 1, card: 'SOR#002', to: [1], a: {} },
        });
        expectRecords(diff(prev, next), [
            { t: 'reveal', e: 1, card: 'SOR#001', to: [2] },
            { t: 'reveal', e: 2, card: 'SOR#002', to: [1] },
        ]);
    });

    it('throws when an audience narrows or a known card changes', () => {
        const wide = board({ 1: { zone: 'hand', owner: 1, card: 'SOR#001', to: 'all', a: {} } });
        const narrow = board({ 1: { zone: 'hand', owner: 1, card: 'SOR#001', to: [1], a: {} } });
        const other = board({ 1: { zone: 'hand', owner: 1, card: 'SOR#002', to: 'all', a: {} } });
        const lost = board({ 1: { zone: 'hand', owner: 1, a: {} } });
        expect(codeOf(() => diff(wide, narrow))).toBe('result-mismatch');
        expect(codeOf(() => diff(wide, other))).toBe('result-mismatch');
        expect(codeOf(() => diff(wide, lost))).toBe('result-mismatch');
        expect(() => diff(wide, narrow)).toThrowError(/narrow/);
    });

    it('is exported from the writer entry and serializes', () => {
        expect(writerEntry.diff).toBe(diff);
        expect(typeof serialize).toBe('function');
        expect(apply([]).seq).toBeNull();
    });
});
