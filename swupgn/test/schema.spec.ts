import Ajv2020 from 'ajv/dist/2020';
import type { ValidateFunction } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

const packageDir = path.resolve(__dirname, '..', '..');
const schema = JSON.parse(fs.readFileSync(path.join(packageDir, 'schema', 'swupgn.schema.json'), 'utf8'));

function buildAjv() {
    const ajv = new Ajv2020({ strict: true, allErrors: true });
    ajv.addSchema(schema);
    return ajv;
}

function validator(def: string): ValidateFunction {
    const fn = buildAjv().getSchema(`urn:swupgn:0.1#/$defs/${def}`);
    if (!fn) {
        throw new Error(`no $defs/${def}`);
    }
    return fn;
}

describe('swupgn.schema.json', function () {
    it('compiles under ajv 2020-12 strict mode', function () {
        const ajv = buildAjv();
        for (const def of Object.keys(schema.$defs)) {
            expect(ajv.getSchema(`urn:swupgn:0.1#/$defs/${def}`)).toBeDefined(def);
        }
        expect(schema.$id).toBe('urn:swupgn:0.1');
    });

    it('published schema compiles under ajv strict mode with no custom keywords', function () {
        const ajv = new Ajv2020({ strict: true });
        expect(() => ajv.compile(JSON.parse(fs.readFileSync(path.join(packageDir, 'schema', 'swupgn.schema.json'), 'utf8')))).not.toThrow();
    });

    it('accepts every record line of design 7.1', function () {
        const record = validator('record');
        const text = fs.readFileSync(path.join(packageDir, 'test', 'fixtures', 'design-7-1.ndjson'), 'utf8');
        const lines = text.split('\n').filter((l) => l.length > 0);
        expect(lines.length).toBeGreaterThan(50);
        for (const line of lines) {
            expect(record(JSON.parse(line))).toBe(true, `${line} ${JSON.stringify(record.errors)}`);
        }
    });

    it('rejects a create without owner', function () {
        expect(validator('create')({ t: 'create', e: 1, zone: 'hand' })).toBe(false);
    });

    it('rejects parent without rel, and rel without parent', function () {
        const create = validator('create');
        const base = { t: 'create', e: 2, zone: 'ground', owner: 1 };
        expect(create({ ...base, parent: 1 })).toBe(false);
        expect(create({ ...base, rel: 'attached' })).toBe(false);
        expect(create({ ...base, parent: 1, rel: 'attached' })).toBe(true);
    });

    it('requires rel: null when a set detaches with parent: null', function () {
        const set = validator('set');
        expect(set({ t: 'set', e: 2, parent: null })).toBe(false);
        expect(set({ t: 'set', e: 2, parent: null, rel: null })).toBe(true);
        expect(set({ t: 'set', e: 2, parent: null, rel: 'attached' })).toBe(false);
    });

    it('rejects a step with a non-integer seq', function () {
        const step = validator('step');
        expect(step({ t: 'step', seq: 1.5 })).toBe(false);
        expect(step({ t: 'step', seq: '1' })).toBe(false);
        expect(step({ t: 'step', seq: 1 })).toBe(true);
    });

    describe('header', function () {
        const valid: Record<string, string> = {
            Game: 'SWU-PGN/0.1', Visibility: 'full', Steps: 'decision', GameId: 'g1', Date: '2026.11.03',
            CardPool: 'ic27', Engine: 'x', P1Id: 'a', P2Id: 'b', P1: 'A', P2: 'B', P1Leader: 'SOR#005',
            P1Base: 'SOR#026', P2Leader: 'SOR#010', P2Base: 'SOR#029', Result: 'p1', Reason: 'base', Rounds: '3',
        };

        it('accepts the required tags and unknown tags', function () {
            expect(validator('header')({ ...valid, Whatever: 'x' })).toBe(true);
        });

        it('rejects a bad Game, Visibility or Steps, a missing tag and a non-string value', function () {
            const header = validator('header');
            expect(header({ ...valid, Game: 'SWU-PGN/1.0' })).toBe(false);
            expect(header({ ...valid, Game: 'SWU-PGN/0.x' })).toBe(false);
            expect(header({ ...valid, Visibility: 'secret' })).toBe(false);
            expect(header({ ...valid, Steps: 'turn' })).toBe(false);
            const { Reason, ...missing } = valid;
            expect(Reason).toBe('base');
            expect(header(missing)).toBe(false);
            expect(header({ ...valid, Rounds: 3 })).toBe(false);
            expect(header({ ...valid, Visibility: 'perspective:2' })).toBe(true);
        });
    });

    it('accepts DECKS lines from design 4.2 and rejects a counted entry in an incomplete deck shape', function () {
        const deck = validator('deckLine');
        expect(deck({ p: 1, leaders: ['SOR#005'], base: 'SOR#026', complete: true, main: [['SOR#095', 3]], sideboard: [['SOR#210', 1]], order: ['SOR#160'] })).toBe(true);
        expect(deck({ p: 2, leaders: ['SOR#010'], base: 'SOR#029', complete: false, main: [['SOR#130'], ['SOR#201']] })).toBe(true);
        expect(deck({ p: 2, leaders: ['SOR#010'], base: 'SOR#029', complete: false, main: [[3]] })).toBe(false);
    });
});
