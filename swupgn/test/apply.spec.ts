import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../src/parse';
import { apply, applyRecord, boardAt, emptyBoard } from '../src/apply';
import { SwuPgnError } from '../src/errors';
import type { Board, CreateRecord, SwuRecord } from '../src/generated/types';

function codeOf(fn: () => unknown): { code?: string; line?: number } {
    try {
        fn();
    } catch (e) {
        if (e instanceof SwuPgnError) {
            return { code: e.code, line: e.line };
        }
        throw e;
    }
    return {};
}

function fileOf(records: string[]): string {
    return ['[Game "SWU-PGN/0.1"]', '[Visibility "full"]', '[Steps "decision"]', '[GameId "t"]', '[Date "2026-11-03T12:00:00Z"]', '[CardPool "SOR"]', '[Engine "t@0"]',
        '[P1Id "sha256:00"]', '[P2Id "sha256:01"]', '[P1 "A"]', '[P2 "B"]', '[Result "Incomplete"]', '[Reason "x"]', '[Rounds "1"]',
        '[P1Leader "SOR#005"]', '[P2Leader "SOR#010"]', '[P1Base "SOR#026"]', '[P2Base "SOR#029"]', '', '%%% RECORDS', ...records, ''].join('\n');
}

const create = (e: number, extra: Partial<CreateRecord> = {}): SwuRecord => ({ t: 'create', e, zone: 'hand', owner: 1, ...extra });

describe('apply', () => {
    it('starts with g, p1 and p2 and a null seq', () => {
        const want: Board = { seq: null, entities: { g: { a: {} }, p1: { a: {} }, p2: { a: {} } } };
        expect(emptyBoard()).toEqual(want);
    });

    it('applies every vector to its board.json', () => {
        const dir = path.resolve(__dirname, '..', '..', 'vectors');
        const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
        let n = 0;
        for (const v of manifest.vectors) {
            for (const profile of v.profiles) {
                const file = parse(fs.readFileSync(path.join(dir, `${v.name}.${profile}.swupgn`), 'utf8'));
                const want = JSON.parse(fs.readFileSync(path.join(dir, `${v.name}.${profile}.board.json`), 'utf8'));
                expect(apply(file.records)).withContext(`${v.name}.${profile}`)
                    .toEqual(want);
                n++;
            }
        }
        expect(n).toBeGreaterThan(0);
    });

    it('throws unknown-entity with the line for a set before create', () => {
        const file = parse(fileOf(['{"t":"step","seq":0}', '{"t":"set","e":7,"a":{"damage":1}}']));
        expect(codeOf(() => apply(file.records))).toEqual({ code: 'unknown-entity', line: 22 });
        expect(codeOf(() => boardAt(file, 0))).toEqual({});
    });

    it('throws unknown-entity for an unknown parent, and for remove or reveal of g, p1, p2', () => {
        expect(codeOf(() => apply([create(1, { parent: 9, rel: 'attached' })])).code).toBe('unknown-entity');
        expect(codeOf(() => apply([{ t: 'remove', e: 'p1' as unknown as number }])).code).toBe('unknown-entity');
        expect(codeOf(() => apply([{ t: 'reveal', e: 'g' as unknown as number, card: 'SOR#001', to: 'all' }])).code).toBe('unknown-entity');
    });

    it('throws duplicate-entity for a second create of a live id', () => {
        expect(codeOf(() => apply([create(1), create(1)])).code).toBe('duplicate-entity');
    });

    it('throws reused-id for a create after remove', () => {
        expect(codeOf(() => apply([create(1), { t: 'remove', e: 1 }, create(1)])).code).toBe('reused-id');
    });

    it('keeps unknown and x_ attributes, and unknown zone and relation names', () => {
        const b = apply([create(1, { zone: 'x_zone', a: { x_foo: [1, { b: 2 }], mystery: 'm' } }), { t: 'set', e: 1, a: { x_foo: 3 } }]);
        expect(b.entities['1'].zone).toBe('x_zone');
        expect(JSON.stringify(b.entities['1'].a)).toBe('{"x_foo":3,"mystery":"m"}');
    });

    it('ignores unknown record types and blocks', () => {
        const b = apply([{ t: 'x_thing', e: 4 } as unknown as SwuRecord, { t: 'block', id: 1, kind: 'draw' }, create(1)]);
        expect(Object.keys(b.entities).sort()).toEqual(['1', 'g', 'p1', 'p2']);
        expect(b.seq).toBeNull();
    });

    it('does not crash on non-object records', () => {
        const junk = [null, 5, [1]] as unknown as SwuRecord[];
        expect(Object.keys(apply(junk).entities).length).toBe(3);
    });

    it('stores to all for a create with card and no to', () => {
        expect(apply([create(1, { card: 'SOR#001' })]).entities['1'].to).toBe('all');
        expect(apply([create(1)]).entities['1'].to).toBeUndefined();
    });

    it('merges reveal audiences', () => {
        const b = apply([create(1, { card: 'SOR#001', to: [2] }), { t: 'reveal', e: 1, card: 'SOR#002', to: [1] }]);
        expect(b.entities['1'].to).toEqual([1, 2]);
        expect(b.entities['1'].card).toBe('SOR#002');
        applyRecord(b, { t: 'reveal', e: 1, card: 'SOR#002', to: 'all' });
        expect(b.entities['1'].to).toBe('all');
        applyRecord(b, { t: 'reveal', e: 1, card: 'SOR#002', to: [1] });
        expect(b.entities['1'].to).toBe('all');
    });

    it('deletes on null in set', () => {
        const b = apply([create(1, { controller: 2, a: { damage: 1, k: 'v' } }), create(2, { parent: 1, rel: 'attached' }),
            { t: 'set', e: 1, controller: null, a: { damage: null } }, { t: 'set', e: 2, parent: null }]);
        expect(b.entities['1'].controller).toBeUndefined();
        expect('controller' in b.entities['1']).toBe(false);
        expect(JSON.stringify(b.entities['1'].a)).toBe('{"k":"v"}');
        expect('parent' in b.entities['2'] || 'rel' in b.entities['2']).toBe(false);
    });

    it('replaces array attributes whole', () => {
        const b = apply([create(1, { a: { l: [1, 2] } }), { t: 'set', e: 1, a: { l: [3] } }]);
        expect(JSON.stringify(b.entities['1'].a.l)).toBe('[3]');
    });

    it('boardAt stops after the named step', () => {
        const file = parse(fileOf(['{"t":"step","seq":0}', '{"t":"create","e":1,"zone":"hand","owner":1}', '{"t":"step","seq":1}',
            '{"t":"create","e":2,"zone":"hand","owner":1}', '{"t":"step","seq":2}']));
        const b = boardAt(file, 1);
        expect(b.seq).toBe(1);
        expect(Object.keys(b.entities).sort()).toEqual(['1', 'g', 'p1', 'p2']);
        expect(apply(file.records, { untilSeq: 0 }).seq).toBe(0);
    });

    it('boardAt a step past the end gives the last board', () => {
        const file = parse(fileOf(['{"t":"step","seq":0}']));
        expect(boardAt(file, 9).seq).toBe(0);
    });
});
