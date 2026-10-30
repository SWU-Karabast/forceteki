import Ajv from 'ajv/dist/2020';
import * as fs from 'fs';
import * as path from 'path';
import { engineProduct, fold, parse, render, validate } from '../../../swupgn/src/index';

const VECTOR_DIR = path.resolve(__dirname, '../../../../swupgn/test-vectors');
const SCHEMA_DIR = path.resolve(__dirname, '../../../../swupgn/schema');

interface ManifestEntry {
    file: string;
    class: 'positive' | 'negative';
    writer: string;
    level: string;
    errors: string[];
    warnings: string[];
    fold?: string;
    render?: string;
}

const manifest = JSON.parse(fs.readFileSync(path.join(VECTOR_DIR, 'manifest.json'), 'utf8')) as { vectors: ManifestEntry[] };
const read = (file: string) => fs.readFileSync(path.join(VECTOR_DIR, file), 'utf8');
const sorted = (codes: string[]) => [...new Set(codes)].sort();

// Spec §20: the manifest IS the conformance suite another implementation runs, so the reference
// reader has to pass it exactly as written -- and every vector on disk has to be in it.
describe('SWU-PGN conformance manifest', function () {
    it('lists every vector on disk, and nothing that is not there', function () {
        const onDisk = [
            ...fs.readdirSync(VECTOR_DIR).filter((f) => f.endsWith('.swupgn')),
            ...fs.readdirSync(path.join(VECTOR_DIR, 'negative')).map((f) => `negative/${f}`),
        ].sort();
        expect(manifest.vectors.map((v) => v.file).sort()).toEqual(onDisk);
    });

    it('names the writer of every vector', function () {
        for (const v of manifest.vectors) {
            expect(typeof v.writer).withContext(v.file)
                .toBe('string');
            expect(v.writer.length).withContext(v.file)
                .toBeGreaterThan(0);
            if (v.class === 'positive' && v.writer !== 'hand') {
                expect(v.writer).withContext(v.file)
                    .toBe(engineProduct(parse(read(v.file)).header.engine));
            }
        }
    });

    for (const v of manifest.vectors) {
        it(`${v.file}: validate() reports level ${v.level} with exactly the listed codes`, function () {
            const report = validate(read(v.file));
            expect(report.level).toBe(v.level);
            expect(sorted(report.issues.filter((i) => i.severity === 'error').map((i) => i.code))).toEqual(sorted(v.errors));
            expect(sorted(report.issues.filter((i) => i.severity === 'warning').map((i) => i.code))).toEqual(sorted(v.warnings));
        });

        if (v.class === 'positive') {
            it(`${v.file}: folds to ${v.fold} and renders to ${v.render}`, function () {
                const doc = parse(read(v.file));
                expect(fold(doc.events)).toEqual(JSON.parse(read(v.fold)));
                expect(render(doc) + '\n').toBe(read(v.render));
            });
        }
    }
});

// Spec §11: ReducedState is published as a schema, so a folder in another language can check
// its own output without porting the reference reader's types.
describe('reduced-state.schema.json', function () {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const check = ajv.compile(JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, 'reduced-state.schema.json'), 'utf8')) as object);

    for (const v of manifest.vectors.filter((x) => x.fold)) {
        it(`accepts ${v.fold}`, function () {
            expect(check(JSON.parse(read(v.fold)))).withContext(JSON.stringify(check.errors))
                .toBe(true);
        });
    }

    it('rejects a board with a card outside an arena or a reserved token name', function () {
        const board = JSON.parse(read('minimal.fold.json'));
        const card = { id: 'SOR#108', zone: 'hand', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [] };
        expect(check({ ...board, players: { ...board.players, 1: { ...board.players[1], cards: [card] } } })).toBe(false);
        const tokens = JSON.parse('{"constructor":1}');
        const hosted = { ...card, zone: 'ground', statusTokens: tokens };
        expect(check({ ...board, players: { ...board.players, 1: { ...board.players[1], cards: [hosted] } } })).toBe(false);
    });
});
