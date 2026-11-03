import Ajv2020 from 'ajv/dist/2020';
import * as fs from 'fs';
import * as path from 'path';
import { ATTRIBUTES, BLOCK_KINDS, ERROR_CODES, RELATIONS, ZONES, attributeClass } from '../src/registry';

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

    it('set codes are the 12 codes in release order', function () {
        const codes = JSON.parse(fs.readFileSync(path.join(registryDir, 'setCodes.json'), 'utf8'));
        expect(codes.map((c: { code: string }) => c.code)).toEqual(['SOR', 'SHD', 'TWI', 'JTL', 'LOF', 'IBH', 'SEC', 'LAW', 'TS26', 'ASH', 'HMW', 'IC27']);
    });

    it('error codes match the plan table', function () {
        const bySeverity = (severity: string) => ERROR_CODES.filter((c) => c.severity === severity && c.scope === undefined).map((c) => c.code);
        expect(bySeverity('fatal')).toEqual('not-swupgn unsupported-major too-large line-too-long too-many-records too-deep bad-header-line bad-escape duplicate-tag missing-tag bad-count duplicate-section record-outside-section bad-json duplicate-key reserved-key'.split(' '));
        expect(bySeverity('error')).toEqual('schema not-object number-range card-index unknown-entity duplicate-entity reused-id parent-rel seq-order bad-zone bad-relation profile card-not-indexed result-mismatch'.split(' '));
        expect(bySeverity('warning')).toEqual('writer-errors newer-minor unknown-type unknown-section dangling-annotation too-many-issues'.split(' '));
        const notFull = ERROR_CODES.find((c) => c.code === 'not-full');
        expect(notFull?.severity).toBe('fatal');
        expect(notFull?.scope).toBe('api');
        expect(new Set(ERROR_CODES.map((c) => c.code)).size).toBe(ERROR_CODES.length);
    });

    it('attributeClass: unregistered is identity, registered is its class', function () {
        expect(attributeClass('x_foo_bar')).toBe('identity');
        expect(attributeClass('damage')).toBe('public');
        expect(attributeClass('aspects')).toBe('identity');
    });
});
