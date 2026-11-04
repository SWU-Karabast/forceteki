import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../src/parse';
import { serialize } from '../src/serialize';
import { apply } from '../src/apply';
import { redact } from '../src/writer/redact';
import type { View } from '../src/writer/redact';
import { validate } from '../src/validate/index';
import { SwuPgnError } from '../src/errors';
import type { CreateRecord, SwuPgnFile, SwuRecord } from '../src/generated/types';

const packageDir = path.resolve(__dirname, '..', '..');
const vectorsDir = path.join(packageDir, 'vectors');
const manifest: { vectors: { name: string; profiles: string[] }[] } = JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8'));

const VIEWS: { profile: string; view: View }[] = [{ profile: 'p1', view: 1 }, { profile: 'p2', view: 2 }, { profile: 'public', view: 'public' }];

function read(rel: string): string {
    return fs.readFileSync(path.join(vectorsDir, rel), 'utf8');
}

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

/** A small full file: both decks complete, the given records. */
function fullFile(records: SwuRecord[], extraSections = ''): SwuPgnFile {
    const text = ['[Game "SWU-PGN/0.1"]', '[Visibility "full"]', '[Steps "decision"]', '[GameId "t"]', '[Date "2026-11-03T12:00:00Z"]',
        '[CardPool "SOR"]', '[Engine "t@0"]',
        '[P1Id "sha256:91f2049e8d2099e727801519bfa488ad5db4edcdde37ed9c8769abe0a10396f1"]',
        '[P2Id "sha256:23c0c1f42e0c03a276c7a337804026b4f5e2314cf50971e2747dd24100673030"]',
        '[P1 "Player 1"]', '[P2 "Player 2"]', '[Result "Incomplete"]', '[Reason "x"]', '[Rounds "1"]',
        '[P1Leader "SOR#005"]', '[P2Leader "SOR#010"]', '[P1Base "SOR#026"]', '[P2Base "SOR#029"]', '[Seed "s"]',
        extraSections,
        '%%% DECKS',
        '{"p":1,"leaders":["SOR#005"],"base":"SOR#026","complete":true,"main":[["SOR#095",3],["SOR#046",3]],"order":["SOR#095"]}',
        '{"p":2,"leaders":["SOR#010"],"base":"SOR#029","complete":true,"main":[["SOR#130",3],["SOR#201",3]],"sideboard":[["SOR#140",1]]}',
        '%%% RECORDS', ...records.map((r) => JSON.stringify(r)), ''].join('\n');
    return parse(text);
}

const BOARD: SwuRecord[] = [
    { t: 'create', e: 1, zone: 'base', owner: 1, card: 'SOR#026', a: { kind: 'base', damage: 0, hp: 30 } },
    { t: 'create', e: 2, zone: 'base', owner: 2, card: 'SOR#029', a: { kind: 'base', damage: 0, hp: 28 } },
];

const created = (file: SwuPgnFile): CreateRecord[] => file.records.filter((r): r is CreateRecord => r.t === 'create');

describe('redact', function () {
    describe('the conformance vectors', function () {
        for (const vector of manifest.vectors) {
            for (const { profile, view } of VIEWS) {
                describe(`${vector.name} → ${profile}`, function () {
                    let out: SwuPgnFile;

                    beforeAll(function () {
                        out = redact(parse(read(`${vector.name}.full.swupgn`)), view);
                    });

                    it('full → p1 / p2 / public equals each vector, byte for byte after serialize', function () {
                        expect(serialize(out)).toBe(read(`${vector.name}.${profile}.swupgn`));
                    });

                    it('the output validates as valid', function () {
                        const report = validate(serialize(out));
                        expect(report.issues).toEqual([]);
                        expect(report.level).toBe('valid');
                    });

                    it('never reuses an output id: ids are 1..n in first-use order', function () {
                        const ids = created(out).map((r) => r.e);
                        expect(ids).toEqual(ids.map((_e, i) => i + 1));
                    });

                    it('holds no card whose to lacks the viewer', function () {
                        for (const r of out.records) {
                            if ((r.t === 'create' || r.t === 'reveal') && r.card !== undefined) {
                                const to = r.to ?? 'all';
                                expect(to === 'all' || (view !== 'public' && to.includes(view))).toBe(true, JSON.stringify(r));
                            }
                        }
                    });
                });
            }
        }

        it('hand-loss-x and hand-loss-u redact to the same p2 and public bytes', function () {
            for (const view of [2, 'public'] as View[]) {
                const x = serialize(redact(parse(read('hand-loss-x.full.swupgn')), view));
                const u = serialize(redact(parse(read('hand-loss-u.full.swupgn')), view));
                expect(x === u).toBe(true, `view ${view}`);
            }
        });
    });

    it('throws not-full on a perspective input', function () {
        for (const profile of ['p1', 'p2', 'public']) {
            const file = parse(read(`tiny.${profile}.swupgn`));
            expect(codeOf(() => redact(file, 1))).toBe('not-full');
            expect(codeOf(() => redact(file, 'public'))).toBe('not-full');
        }
    });

    it('drops unknown and x_ attributes on anonymous entities, keeps them on known ones', function () {
        const full = fullFile([...BOARD,
            { t: 'create', e: 3, zone: 'resource', owner: 1, card: 'SOR#046', to: [1], a: { exhausted: false, cost: 2, power: 3, x_note: 'n', zzz: 1 } },
            { t: 'step', seq: 0 },
            { t: 'set', e: 3, a: { exhausted: true, x_note: 'm', cost: 3 } },
            { t: 'step', seq: 1 }]);
        const p2 = redact(full, 2);
        expect(p2.records[2] as unknown).toEqual({ t: 'create', e: 3, zone: 'resource', owner: 1, to: [1], a: { exhausted: false } });
        expect(p2.records[4] as unknown).toEqual({ t: 'set', e: 3, a: { exhausted: true } });
        const p1 = redact(full, 1);
        expect(p1.records[2] as unknown).toEqual(full.records[2]);
        expect(p1.records[4] as unknown).toEqual(full.records[4]);
    });

    it('a known card bounced to the opponent hand keeps its id; after it goes on top of the deck the viewer has no entity', function () {
        const p2 = redact(parse(read('known-in-hand.full.swupgn')), 2);
        const played = created(p2).find((r) => r.card === 'SOR#095') as CreateRecord;
        expect(played).toBeDefined();
        const bounce = p2.records.find((r) => r.t === 'set' && r.e === played.e && r.zone === 'hand');
        expect(bounce).toBeDefined('the bounce is a set of the same entity');
        expect(p2.records.some((r) => r.t === 'remove' && r.e === played.e)).toBe(true);
        const board = apply(p2.records);
        expect(Object.values(board.entities).filter((e) => e.card === 'SOR#095')).toEqual([]);
        expect(created(p2).filter((r) => r.card === 'SOR#095').length).toBe(1, 'the card drawn again later is not known to p2');
    });

    it('drops ref attribute values pointing at unmaterialized entities, and the words with them', function () {
        const full = fullFile([...BOARD,
            { t: 'create', e: 3, zone: 'hand', owner: 1, card: 'SOR#046', to: [1] },
            { t: 'create', e: 4, zone: 'ground', owner: 1, card: 'SOR#095', a: { kind: 'unit', exhausted: false } },
            { t: 'create', e: 5, owner: 1, to: 'all', a: { kind: 'effect', src: 4, targets: [3, 4, 'p2'], duration: 'phase', ability: 'x', text: 'buff' } },
            { t: 'set', e: 5, a: { src: 3 } },
            { t: 'step', seq: 0 }]);
        const p2 = redact(full, 2);
        const records = p2.records.slice(BOARD.length);
        expect(records as unknown).toEqual([
            { t: 'create', e: 3, zone: 'ground', owner: 1, card: 'SOR#095', a: { kind: 'unit', exhausted: false } },
            { t: 'create', e: 4, owner: 1, to: 'all', a: { kind: 'effect', src: 3, targets: [3, 'p2'], duration: 'phase' } },
            { t: 'step', seq: 0 },
        ]);
        const p1 = redact(full, 1);
        expect(p1.records[BOARD.length + 2] as unknown).toEqual({ t: 'create', e: 5, owner: 1, to: 'all', a: { kind: 'effect', src: 4, targets: [3, 4, 'p2'], duration: 'phase', ability: 'x', text: 'buff' } });
    });

    it('forgets every known card of a hidden hand on a face-down departure, and knows a forgotten card again when it enters a public zone', function () {
        const full = fullFile([...BOARD,
            { t: 'create', e: 3, zone: 'hand', owner: 1, card: 'SOR#046', to: [1] },
            { t: 'create', e: 4, zone: 'hand', owner: 1, card: 'SOR#095', to: [1] },
            { t: 'step', seq: 0 },
            { t: 'reveal', e: 3, card: 'SOR#046', to: [2] },
            { t: 'set', e: 4, zone: 'resource', a: { exhausted: false } },
            { t: 'set', e: 3, zone: 'ground', a: { kind: 'unit' } },
            { t: 'step', seq: 1 }]);
        expect(redact(full, 2).records.slice(BOARD.length) as unknown).toEqual([
            { t: 'step', seq: 0 },
            { t: 'create', e: 3, zone: 'hand', owner: 1, card: 'SOR#046', to: [1, 2] },
            { t: 'remove', e: 3 },
            { t: 'create', e: 4, zone: 'resource', owner: 1, to: [1], a: { exhausted: false } },
            { t: 'create', e: 5, zone: 'ground', owner: 1, card: 'SOR#046', to: [1, 2], a: { kind: 'unit' } },
            { t: 'step', seq: 1 },
        ]);
    });

    it('drops a block\'s text with a dropped reference, except the chosen name of a name block', function () {
        const full = fullFile([...BOARD,
            { t: 'create', e: 3, zone: 'hand', owner: 1, card: 'SOR#046', to: [1] },
            { t: 'block', id: 1, kind: 'look', p: 1, targets: [3, 'p1'], text: 'Consular Security Force' },
            { t: 'block', id: 2, kind: 'name', p: 1, src: 3, text: 'Wampa' },
            { t: 'block', id: 3, kind: 'look', p: 1, targets: [1], text: 'kept' },
            { t: 'step', seq: 0 }]);
        expect(redact(full, 2).records.slice(BOARD.length) as unknown).toEqual([
            { t: 'block', id: 1, kind: 'look', p: 1, targets: ['p1'] },
            { t: 'block', id: 2, kind: 'name', p: 1, text: 'Wampa' },
            { t: 'block', id: 3, kind: 'look', p: 1, targets: [1], text: 'kept' },
            { t: 'step', seq: 0 },
        ]);
        expect(redact(full, 1).records.slice(BOARD.length + 1, BOARD.length + 3) as unknown).toEqual([
            { t: 'block', id: 1, kind: 'look', p: 1, targets: [3, 'p1'], text: 'Consular Security Force' },
            { t: 'block', id: 2, kind: 'name', p: 1, src: 3, text: 'Wampa' },
        ]);
    });

    it('refuses a parent it cannot map (parent-rel), never emitting the record without it', function () {
        const full = fullFile([...BOARD,
            { t: 'create', e: 3, zone: 'hand', owner: 1, card: 'SOR#046', to: [1] },
            { t: 'create', e: 4, zone: 'hand', owner: 1, parent: 3, rel: 'attached', card: 'SOR#095', to: 'all' },
            { t: 'step', seq: 0 }]);
        expect(codeOf(() => redact(full, 2))).toBe('parent-rel');
        expect(codeOf(() => redact(full, 1))).toBeUndefined();
    });

    it('copies no unknown record type, STORY, ANNOTATIONS or unknown section, and drops Seed and order', function () {
        const full = fullFile([...BOARD, { t: 'x_thing', e: 1 } as unknown as SwuRecord, { t: 'step', seq: 0 }],
            '\n%%% STORY\nP1 holds Wampa\n\n%%% X_EXTRA\nsecret\n\n%%% ANNOTATIONS\n{"seq":0,"text":"hi"}\n');
        expect(full.story).toBeDefined();
        expect(full.annotations.length).toBe(1);
        const p1 = redact(full, 1);
        expect(p1.story).toBeUndefined();
        expect(p1.annotations).toEqual([]);
        expect(p1.unknownSections).toEqual([]);
        expect(p1.records.map((r) => r.t)).toEqual(['create', 'create', 'step']);
        expect(p1.header.Seed).toBeUndefined();
        expect(p1.header.Visibility).toBe('perspective:1');
        expect(p1.decks[0] as unknown).toEqual({ p: 1, leaders: ['SOR#005'], base: 'SOR#026', complete: true, main: [['SOR#095', 3], ['SOR#046', 3]] });
        expect(p1.decks[1] as unknown).toEqual({ p: 2, leaders: ['SOR#010'], base: 'SOR#029', complete: false, main: [] });
    });

    it('does not change its input', function () {
        const text = read('attachments.full.swupgn');
        const file = parse(text);
        redact(file, 2);
        expect(serialize(file)).toBe(text);
    });
});
