import * as writerEntry from '../src/writer';
import { diff } from '../src/writer/diff';
import { apply, applyRecord, cloneBoard, emptyBoard } from '../src/apply';
import { serialize } from '../src/serialize';
import { SwuPgnError } from '../src/errors';
import { canonicalAttrNames } from '../src/attrOrder';
import { boardPairs } from './helpers/boards';
import { validate } from '../src/validate/index';
import * as fs from 'fs';
import * as path from 'path';
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

const PLAY = ['ground', 'space', 'base'];

/** Apply record by record, asserting [W-28] after every one. */
function expectW28After(prev: Board, records: SwuRecord[], label: string): void {
    const b = cloneBoard(prev);
    for (const r of records) {
        applyRecord(b, r);
        for (const [id, e] of Object.entries(b.entities)) {
            if (e.parent !== undefined) {
                const p = b.entities[String(e.parent)];
                expect(p !== undefined && PLAY.includes(p.zone as string)).withContext(`${label}: parent of ${id} after ${JSON.stringify(r)}`)
                    .toBe(true);
                expect(e.zone === p?.zone || e.rel === 'captured').withContext(`${label}: zone of ${id} after ${JSON.stringify(r)}`)
                    .toBe(true);
            }
        }
    }
}

const HEADER = fs.readFileSync(path.resolve(__dirname, '..', '..', 'vectors', 'negative', 'parent-rel.swupgn'), 'utf8').split('%%% RECORDS')[0];

/** The issues the validator reports on a file holding `diff(empty, prev)`, a step, then `records`. */
function structuralIssues(prev: Board, records: SwuRecord[]): string[] {
    const lines = diff(emptyBoard(), prev).concat([{ t: 'step', seq: 0 }], records, [{ t: 'step', seq: 1 }])
        .map((r) => JSON.stringify(r));
    const report = validate(HEADER + '%%% RECORDS\n' + lines.join('\n') + '\n');
    return report.issues.filter((i) => ['parent-rel', 'unknown-entity', 'duplicate-entity', 'reused-id', 'bad-relation'].includes(i.code)).map((i) => `${i.code}@${String(i.line)}`);
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
            expectW28After(prev, records, 'pair ' + i);
            expect(structuralIssues(prev, records)).withContext('pair ' + i)
                .toEqual([]);
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
        expect(codeOf(() => diff(wide, narrow))).toBe('unreachable-board');
        expect(codeOf(() => diff(wide, other))).toBe('unreachable-board');
        expect(codeOf(() => diff(wide, lost))).toBe('unreachable-board');
        expect(() => diff(wide, narrow)).toThrowError(/narrow/);
    });

    it('sets leave a parent that leaves play in an order that keeps W-28', () => {
        const unit = { owner: 1 as const, a: {} };
        // A: the unit goes to hand and its upgrade to discard: the upgrade detaches first
        const a = diff(board({ 5: { ...unit, zone: 'ground' }, 6: { ...unit, zone: 'ground', parent: 5, rel: 'attached' } }),
            board({ 5: { ...unit, zone: 'hand' }, 6: { ...unit, zone: 'discard' } }));
        expectRecords(a, [{ t: 'set', e: 6, zone: 'discard', parent: null, rel: null }, { t: 'set', e: 5, zone: 'hand' }]);
        // B: the upgrade moves to unit 7 while its old unit 5 leaves play
        const bPrev = board({ 5: { ...unit, zone: 'ground' }, 6: { ...unit, zone: 'ground', parent: 5, rel: 'attached' }, 7: { ...unit, zone: 'space' } });
        const bNext = board({ 5: { ...unit, zone: 'discard' }, 6: { ...unit, zone: 'space', parent: 7, rel: 'attached' }, 7: { ...unit, zone: 'space' } });
        const b = diff(bPrev, bNext);
        expectRecords(b, [{ t: 'set', e: 6, zone: 'space', parent: 7, rel: 'attached' }, { t: 'set', e: 5, zone: 'discard' }]);
        expectW28After(bPrev, b, 'B');
        // C2: pilot 5 attaches to vehicle 7, which enters play (the pilot has the lower id)
        const cPrev = board({ 5: { ...unit, zone: 'ground' }, 7: { ...unit, zone: 'hand' } });
        const cNext = board({ 5: { ...unit, zone: 'space', parent: 7, rel: 'pilot' }, 7: { ...unit, zone: 'space' } });
        const c = diff(cPrev, cNext);
        expectRecords(c, [{ t: 'set', e: 7, zone: 'space' }, { t: 'set', e: 5, zone: 'space', parent: 7, rel: 'pilot' }]);
        expectW28After(cPrev, c, 'C2');
    });

    it('throws when a parent changes zone while keeping a child', () => {
        const unit = { owner: 1 as const, a: {} };
        const prev = board({ 5: { ...unit, zone: 'ground' }, 6: { ...unit, zone: 'ground', parent: 5, rel: 'attached' } });
        const next = board({ 5: { ...unit, zone: 'space' }, 6: { ...unit, zone: 'space', parent: 5, rel: 'attached' } });
        expect(codeOf(() => diff(prev, next))).toBe('unreachable-board');
    });

    it('a card entering play from a hidden zone is revealed first, even when its audience is already all', () => {
        const prev = board({ 5: { zone: 'hand', owner: 1, card: 'SOR#001', to: 'all', a: {} }, 6: { zone: 'resource', owner: 1, card: 'SOR#002', to: [1], a: {} } });
        const next = board({ 5: { zone: 'ground', owner: 1, card: 'SOR#001', to: 'all', a: {} }, 6: { zone: 'discard', owner: 1, card: 'SOR#002', to: 'all', a: {} } });
        expectRecords(diff(prev, next), [
            { t: 'reveal', e: 5, card: 'SOR#001', to: 'all' },
            { t: 'reveal', e: 6, card: 'SOR#002', to: 'all' },
            { t: 'set', e: 5, zone: 'ground' },
            { t: 'set', e: 6, zone: 'discard' },
        ]);
        // no reveal when the card moves between public zones
        const pub = diff(board({ 5: { zone: 'ground', owner: 1, card: 'SOR#001', to: 'all', a: {} } }), board({ 5: { zone: 'discard', owner: 1, card: 'SOR#001', to: 'all', a: {} } }));
        expectRecords(pub, [{ t: 'set', e: 5, zone: 'discard' }]);
    });

    it('is exported from the writer entry and serializes', () => {
        expect(writerEntry.diff).toBe(diff);
        expect(typeof serialize).toBe('function');
        expect(apply([]).seq).toBeNull();
    });
});
