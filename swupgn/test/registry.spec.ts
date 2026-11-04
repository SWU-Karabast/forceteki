import Ajv2020 from 'ajv/dist/2020';
import * as fs from 'fs';
import * as path from 'path';
import { ATTRIBUTES, BLOCK_KINDS, BLOCK_REFERENCE_FIELDS, ERROR_CODES, RELATIONS, ZONES, attributeClass } from '../src/registry';
import type { BlockField } from '../src/registry';

const packageDir = path.resolve(__dirname, '..', '..');
const registryDir = path.join(packageDir, 'registry');

function names(list: readonly { name: string }[]): string[] {
    return list.map((x) => x.name);
}

describe('registry', function () {
    it('every registry file validates against registry.schema.json', function () {
        const ajv = new Ajv2020({ strict: true, allErrors: true });
        const registrySchema = JSON.parse(fs.readFileSync(path.join(registryDir, 'registry.schema.json'), 'utf8'));
        ajv.addSchema(registrySchema);
        const files = fs.readdirSync(registryDir).filter((f) => f.endsWith('.json') && f !== 'registry.schema.json');
        expect(files.sort()).toEqual(['attributes.json', 'blockKinds.json', 'errorCodes.json', 'relations.json', 'setCodes.json', 'zones.json']);
        for (const file of files) {
            const def = file.replace('.json', '');
            const validate = ajv.getSchema(`urn:swupgn:0.1:registry#/$defs/${def}`);
            expect(validate).toBeDefined(def);
            const data = JSON.parse(fs.readFileSync(path.join(registryDir, file), 'utf8'));
            expect(validate?.(data)).toBe(true, `${file} ${JSON.stringify(validate?.errors)}`);
        }
    });

    it('attribute names are unique', function () {
        const all = names(ATTRIBUTES);
        expect(new Set(all).size).toBe(all.length);
    });

    it('has every attribute in design 3.2', function () {
        expect(names(ATTRIBUTES)).toEqual((
            'round phase active initiative initiativeTaken result deckCount handCount credits force kind exhausted damage power hp keywords traits aspects cost name blank leaderUnit copyOf deployed onStartingSide epicActionUsed defeated abilityUses src targets duration untilText ability text'
        ).split(' '));
    });

    it('zones are exactly design 3.3, with their visibility', function () {
        expect(names(ZONES)).toEqual(['deck', 'hand', 'resource', 'ground', 'space', 'discard', 'base', 'captured', 'setAside']);
        const opponent = Object.fromEntries(ZONES.map((z) => [z.name, z.opponentSees]));
        expect(opponent).toEqual({
            deck: 'count', hand: 'count', resource: 'anonymous', ground: 'public', space: 'public',
            discard: 'public', base: 'public', captured: 'public', setAside: 'public',
        });
        expect(ZONES.find((z) => z.name === 'deck')?.ownerSees).toBe('count');
        expect(ZONES.filter((z) => z.name !== 'deck').every((z) => z.ownerSees === 'known')).toBe(true);
    });

    it('relations are exactly attached, pilot, captured', function () {
        expect(names(RELATIONS)).toEqual(['attached', 'pilot', 'captured']);
    });

    it('block kinds are exactly design 5.2', function () {
        expect(names(BLOCK_KINDS)).toEqual((
            'play deploy attack ability trigger damage heal defeat capture rescue draw discard resource search look choice name shuffle pass initiative mulligan regroup gameEnd'
        ).split(' '));
    });

    it('every block kind has a field contract over the governed fields only', function () {
        const governed = ['p', 'src', 'targets', 'options', 'amount', 'via', 'group'];
        for (const kind of BLOCK_KINDS) {
            expect(kind.fields).toBeDefined(kind.name);
            for (const [field, rule] of Object.entries(kind.fields)) {
                expect(governed).toContain(field);
                expect(['required', 'optional']).toContain(rule?.use);
            }
        }
        expect([...BLOCK_REFERENCE_FIELDS].sort()).toEqual(['options', 'src', 'targets', 'via']);
    });

    it('block contracts of the kinds statistics are derived from', function () {
        const contract = (name: string) => {
            const fields = BLOCK_KINDS.find((k) => k.name === name)?.fields ?? {};
            return Object.fromEntries(Object.entries(fields).map(([field, rule]) => [field, rule?.use]));
        };
        expect(contract('attack')).toEqual({ p: 'required', src: 'required', targets: 'required', via: 'optional' });
        expect(contract('damage')).toEqual({ p: 'optional', src: 'optional', targets: 'required', amount: 'required', group: 'optional' });
        expect(contract('draw')).toEqual({ p: 'required', src: 'optional', targets: 'required', amount: 'required', group: 'optional' });
        expect(contract('pass')).toEqual({ p: 'required' });
        expect(contract('regroup')).toEqual({});
    });

    it('the design 7.1 fixture follows every block contract', function () {
        const lines = fs.readFileSync(path.join(packageDir, 'test', 'fixtures', 'design-7-1.ndjson'), 'utf8').split('\n')
            .filter((l) => l.length > 0);
        const blocks = lines.map((l) => JSON.parse(l)).filter((r) => r.t === 'block');
        expect(blocks.length).toBeGreaterThan(10);
        const issues: string[] = [];
        for (const block of blocks) {
            const fields = BLOCK_KINDS.find((k) => k.name === block.kind)?.fields;
            expect(fields).toBeDefined(block.kind);
            for (const key of Object.keys(block)) {
                if (!['t', 'id', 'kind', 'text', 'parent'].includes(key) && !(fields && key in fields)) {
                    issues.push(`block ${block.id} (${block.kind}) carries ${key}`);
                }
            }
            for (const [field, rule] of Object.entries(fields ?? {})) {
                if (rule?.use === 'required' && !(field in block)) {
                    issues.push(`block ${block.id} (${block.kind}) lacks ${field as BlockField}`);
                }
            }
        }
        expect(issues).toEqual([]);
    });

    it('block-fields is an error that exempts dropped references outside full files', function () {
        const code = ERROR_CODES.find((c) => c.code === 'block-fields');
        expect(code?.severity).toBe('error');
        expect(code?.scope).toBeUndefined();
        expect(code?.condition).toMatch(/not full/);
    });

    it('set codes are the 12 codes in release order', function () {
        const codes = JSON.parse(fs.readFileSync(path.join(registryDir, 'setCodes.json'), 'utf8'));
        expect(codes.map((c: { code: string }) => c.code)).toEqual(['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'IBH', 'SEC', 'LAW', 'TS26', 'ASH', 'HMW', 'IC27']);
    });

    it('error codes match the plan table', function () {
        const bySeverity = (severity: string) => ERROR_CODES.filter((c) => c.severity === severity && c.scope === undefined).map((c) => c.code);
        expect(bySeverity('fatal')).toEqual('not-swupgn unsupported-major too-large line-too-long too-many-records too-deep bad-header-line bad-escape duplicate-tag missing-tag bad-count duplicate-section record-outside-section bad-json duplicate-key reserved-key'.split(' '));
        expect(bySeverity('error')).toEqual('schema not-object number-range card-index unknown-entity duplicate-entity reused-id parent-rel seq-order bad-zone bad-relation profile card-not-indexed result-mismatch block-fields'.split(' '));
        expect(bySeverity('warning')).toEqual('writer-errors newer-minor unknown-type unknown-section dangling-annotation too-many-issues'.split(' '));
        const notFull = ERROR_CODES.find((c) => c.code === 'not-full');
        expect(notFull?.severity).toBe('fatal');
        expect(notFull?.scope).toBe('api');
        expect(new Set(ERROR_CODES.map((c) => c.code)).size).toBe(ERROR_CODES.length);
    });

    it('parent-rel covers a parent outside ground, space and base', function () {
        expect(ERROR_CODES.find((c) => c.code === 'parent-rel')?.condition).toMatch(/ground, space or base/);
    });

    it('attributeClass: unregistered is identity, registered is its class', function () {
        expect(attributeClass('x_foo_bar')).toBe('identity');
        expect(attributeClass('damage')).toBe('public');
        expect(attributeClass('aspects')).toBe('identity');
        expect(attributeClass('abilityUses')).toBe('identity');
    });
});
