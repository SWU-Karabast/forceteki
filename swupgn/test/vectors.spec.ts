import Ajv2020 from 'ajv/dist/2020';
import type { ValidateFunction } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import { ATTRIBUTES, BLOCK_KINDS, BLOCK_REFERENCE_FIELDS, ERROR_CODES, isFaceDownAttribute } from '../src/registry';

/**
 * The conformance vectors are hand-written and frozen; the SDK is tested against them, never the
 * other way round. These checks need no SDK code: they parse each file with a small local reader
 * and hold it to the schema, the profile rules of SPEC §10.4, the block field contracts of §22.4
 * and the canonical form of §4.5. Applying and redacting are checked once the SDK can do them.
 */

const packageDir = path.resolve(__dirname, '..', '..');
const vectorsDir = path.join(packageDir, 'vectors');
const schema = JSON.parse(fs.readFileSync(path.join(packageDir, 'schema', 'swupgn.schema.json'), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true });
ajv.addSchema(schema);

function validator(def: string): ValidateFunction {
    const fn = ajv.getSchema(`urn:swupgn:0.1#/$defs/${def}`);
    if (!fn) {
        throw new Error(`no $defs/${def}`);
    }
    return fn;
}

type Json = Record<string, unknown>;

interface ManifestVector {
    name: string;
    profiles: string[];
    covers: string[];
    identical?: { with: string; profiles: string[] };
}

interface ManifestNegative {
    file: string;
    code: string;
    line: number;
}

interface Manifest {
    vectors: ManifestVector[];
    negative: ManifestNegative[];
}

const manifest: Manifest = JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8'));

const VISIBILITY: Record<string, string> = { full: 'full', p1: 'perspective:1', p2: 'perspective:2', public: 'public' };

/** Tag order of SPEC §4.5 and §5.4. Unknown tags follow, by code point. */
const TAG_ORDER = ['Game', 'Visibility', 'Steps', 'GameId', 'Date', 'EndDate', 'CardPool', 'Engine', 'P1Id', 'P2Id', 'P1', 'P2', 'Result',
    'Reason', 'Rounds', 'Format', 'Match', 'GameNumber', 'Undos', 'P1Leader', 'P2Leader', 'P1Base', 'P2Base', 'Seed', 'WriterRevision', 'WriterErrors'];

/** Key order of each JSON line kind of SPEC §4.5. */
const KEY_ORDER: Record<string, string[]> = {
    create: ['t', 'e', 'zone', 'owner', 'controller', 'parent', 'rel', 'card', 'to', 'a'],
    set: ['t', 'e', 'zone', 'owner', 'controller', 'parent', 'rel', 'a'],
    remove: ['t', 'e'],
    reveal: ['t', 'e', 'card', 'to'],
    step: ['t', 'seq', 'ms'],
    block: ['t', 'id', 'kind', 'p', 'src', 'targets', 'options', 'amount', 'parent', 'via', 'group', 'text'],
    deck: ['p', 'leaders', 'base', 'complete', 'main', 'sideboard', 'order'],
    card: ['id', 'name', 'backSideName'],
    annotation: ['seq', 'text', 'nag', 'by', 'id', 'parent'],
};
const ATTRIBUTE_ORDER = ATTRIBUTES.map((a) => a.name);
const SECTION_ORDER = ['STORY', 'DECKS', 'CARDS', 'RECORDS', 'ANNOTATIONS'];
const RECORD_TYPES = ['create', 'set', 'remove', 'reveal', 'step', 'block'];

interface Line {
    line: number;
    raw: string;
}

interface ParsedFile {
    text: string;
    header: { name: string; value: string; line: number }[];
    sections: { name: string; line: number; lines: Line[] }[];
}

/** A minimal reader for well-formed vector files: header lines, then banners and their lines. */
function readVector(file: string): ParsedFile {
    const text = fs.readFileSync(path.join(vectorsDir, file), 'utf8');
    const lines = text.split('\n');
    lines.pop();
    const out: ParsedFile = { text, header: [], sections: [] };
    lines.forEach((raw, i) => {
        if (raw.startsWith('%%%')) {
            out.sections.push({ name: raw.slice(3).trim()
                .toUpperCase(), line: i + 1, lines: [] });
            return;
        }
        const current = out.sections[out.sections.length - 1];
        if (current) {
            current.lines.push({ line: i + 1, raw });
            return;
        }
        if (raw.trim() === '') {
            return;
        }
        const tag = (/^\[([A-Za-z0-9]+) "((?:[^"\\]|\\["\\])*)"\]$/).exec(raw);
        if (!tag) {
            throw new Error(`${file}:${i + 1}: not one tag pair: ${raw}`);
        }
        out.header.push({ name: tag[1], value: tag[2].replace(/\\(["\\])/g, '$1'), line: i + 1 });
    });
    return out;
}

function jsonLines(file: ParsedFile, name: string): (Line & { value: Json })[] {
    const section = file.sections.find((s) => s.name === name);
    return (section?.lines ?? []).filter((l) => l.raw.trim() !== '').map((l) => ({ ...l, value: JSON.parse(l.raw) }));
}

function headerOf(file: ParsedFile): Record<string, string> {
    return Object.fromEntries(file.header.map((h) => [h.name, h.value]));
}

/** The canonical serialisation of one JSON line, by SPEC §4.5. */
function canonical(value: Json, kind: string): string {
    const order = KEY_ORDER[kind];
    const out: Json = {};
    for (const key of order) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            out[key] = key === 'a' ? canonicalAttributes(value.a as Json) : value[key];
        }
    }
    return JSON.stringify(out);
}

function canonicalAttributes(a: Json): Json {
    const out: Json = {};
    for (const key of ATTRIBUTE_ORDER.filter((k) => Object.prototype.hasOwnProperty.call(a, k))) {
        out[key] = a[key];
    }
    for (const key of Object.keys(a).filter((k) => !ATTRIBUTE_ORDER.includes(k))
        .sort()) {
        out[key] = a[key];
    }
    return out;
}

function holds(to: unknown, seat: number | null): boolean {
    return to === 'all' || (seat !== null && Array.isArray(to) && to.includes(seat));
}

describe('conformance vectors', function () {
    it('the manifest lists vectors and negative files', function () {
        expect(manifest.vectors.map((v) => v.name)).toEqual(['tiny', 'attachments', 'effects-and-uses', 'known-in-hand', 'hand-loss-x', 'hand-loss-u']);
        for (const v of manifest.vectors) {
            expect(v.profiles).toEqual(['full', 'p1', 'p2', 'public']);
            expect(v.covers.length).toBeGreaterThan(0);
            for (const id of v.covers) {
                expect(id).toMatch(/^\[[WPARVH]-\d{2}\]$/);
            }
        }
    });

    it('the manifest covers every redaction step between its vectors', function () {
        const covered = new Set(manifest.vectors.flatMap((v) => v.covers));
        const steps = ['[R-01]', '[R-02]', '[R-03]', '[R-04]', '[R-05]', '[R-06]', '[R-07]', '[R-08]', '[R-09]', '[R-10]', '[R-11]', '[R-13]', '[R-14]', '[R-17]'];
        expect(steps.filter((id) => !covered.has(id))).toEqual([]);
    });

    for (const vector of manifest.vectors) {
        describe(vector.name, function () {
            for (const profile of vector.profiles) {
                const file = `${vector.name}.${profile}.swupgn`;

                describe(profile, function () {
                    let parsed: ParsedFile;

                    beforeAll(function () {
                        parsed = readVector(file);
                    });

                    it('is UTF-8 text with LF line ends, a final LF and no byte order mark', function () {
                        expect(parsed.text.charCodeAt(0)).not.toBe(0xfeff);
                        expect(parsed.text).not.toContain('\r');
                        expect(parsed.text.endsWith('\n')).toBe(true);
                        expect(parsed.header[0]).toEqual({ name: 'Game', value: 'SWU-PGN/0.1', line: 1 });
                    });

                    it('has the canonical layout of W-07 and Appendix B.4', function () {
                        const lines = parsed.text.split('\n');
                        expect(lines.pop()).toBe('', 'the file ends with one LF');
                        expect(lines[lines.length - 1]).not.toBe('', 'no blank line at the end');
                        for (const [i, line] of lines.entries()) {
                            expect(line).not.toMatch(/[ \t]$/, `${file}:${i + 1}: trailing space`);
                        }
                        const firstBanner = lines.findIndex((l) => l.startsWith('%%%'));
                        for (const line of lines.slice(0, firstBanner - 1)) {
                            expect(line).toMatch(/^\[[A-Za-z0-9]+ "(?:[^"\\]|\\["\\])*"\]$/, `${file}: one tag per header line`);
                        }
                        for (const section of parsed.sections) {
                            expect(lines[section.line - 1]).toBe(`%%% ${section.name}`);
                            expect(lines[section.line - 2]).toBe('', `${file}:${section.line}: one blank line before a banner`);
                            expect(section.line < 3 || lines[section.line - 3] !== '').toBe(true, `${file}:${section.line}: only one blank line`);
                            const body = section.lines.map((l) => l.raw);
                            const own = section === parsed.sections[parsed.sections.length - 1] ? body : body.slice(0, -1);
                            expect(own.length).toBeGreaterThan(0, `${file}:${section.line}: no empty section`);
                            expect(own[0]).not.toBe('');
                            expect(own[own.length - 1]).not.toBe('');
                            if (section.name !== 'STORY') {
                                expect(own.filter((l) => l === '')).toEqual([], `${file}:${section.line}: no blank line in a JSON section`);
                            }
                        }
                    });

                    it('has a header, DECKS, CARDS, annotations and records that match the schema', function () {
                        const header = validator('header');
                        expect(header(headerOf(parsed))).toBe(true, JSON.stringify(header.errors));
                        const checks: [string, string][] = [['DECKS', 'deckLine'], ['CARDS', 'cardLine'], ['ANNOTATIONS', 'annotation']];
                        for (const [section, def] of checks) {
                            const fn = validator(def);
                            for (const l of jsonLines(parsed, section)) {
                                expect(fn(l.value)).toBe(true, `${file}:${l.line} ${JSON.stringify(fn.errors)}`);
                            }
                        }
                        const record = validator('record');
                        for (const l of jsonLines(parsed, 'RECORDS')) {
                            if (RECORD_TYPES.includes(l.value.t as string)) {
                                expect(record(l.value)).toBe(true, `${file}:${l.line} ${JSON.stringify(record.errors)}`);
                            } else {
                                expect(profile).toBe('full', `${file}:${l.line}: only a full file may hold an unknown record type (R-13)`);
                                expect(l.value.t as string).toMatch(/^x_/);
                            }
                        }
                    });

                    it('is in canonical form', function () {
                        const names = parsed.header.map((h) => h.name);
                        const known = names.filter((n) => TAG_ORDER.includes(n));
                        expect(known).toEqual([...known].sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b)));
                        const unknown = names.filter((n) => !TAG_ORDER.includes(n));
                        expect(names).toEqual([...known, ...[...unknown].sort()]);
                        const sections = parsed.sections.map((s) => s.name);
                        const knownSections = sections.filter((s) => SECTION_ORDER.includes(s));
                        expect(knownSections).toEqual([...knownSections].sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b)));
                        expect(sections.slice(0, knownSections.length)).toEqual(knownSections);
                        const kinds: [string, string | null][] = [['DECKS', 'deck'], ['CARDS', 'card'], ['ANNOTATIONS', 'annotation'], ['RECORDS', null]];
                        for (const [section, kind] of kinds) {
                            for (const l of jsonLines(parsed, section)) {
                                const k = kind ?? (l.value.t as string);
                                if (KEY_ORDER[k]) {
                                    expect(l.raw).toBe(canonical(l.value, k), `${file}:${l.line}`);
                                }
                            }
                        }
                    });

                    it('meets the rules of its Visibility profile (SPEC §10.4)', function () {
                        const header = headerOf(parsed);
                        expect(header.Visibility).toBe(VISIBILITY[profile]);
                        const viewer = profile === 'p1' ? 1 : profile === 'p2' ? 2 : null;
                        const decks = jsonLines(parsed, 'DECKS').map((l) => l.value);
                        expect(decks.map((d) => d.p)).toEqual([1, 2]);
                        if (profile === 'full') {
                            expect(decks.map((d) => d.complete)).toEqual([true, true]);
                            return;
                        }
                        expect(header.Seed).toBeUndefined();
                        expect(decks.map((d) => d.complete)).toEqual([viewer === 1, viewer === 2]);
                        for (const d of decks) {
                            expect(d.order).toBeUndefined();
                            if (!d.complete) {
                                expect(d.sideboard).toBeUndefined();
                                expect((d.main as unknown[][]).every((m) => m.length === 1)).toBe(true);
                            }
                        }
                        for (const l of jsonLines(parsed, 'RECORDS')) {
                            const r = l.value;
                            if ((r.t === 'create' || r.t === 'reveal') && r.card !== undefined) {
                                expect(holds(r.to ?? 'all', viewer)).toBe(true, `${file}:${l.line}: an identity the viewer may not know`);
                            }
                            if (r.t === 'create' && r.card === undefined && r.to !== undefined && (r.a as Json | undefined)?.kind !== 'effect') {
                                // An anonymous entity: its to is its own seat, and it carries only face-down attributes (R-02, R-05).
                                expect(r.to).toEqual([r.controller ?? r.owner]);
                                const names = Object.keys((r.a as Json | undefined) ?? {});
                                expect(names.filter((n) => !isFaceDownAttribute(n))).toEqual([], `${file}:${l.line}`);
                            }
                        }
                        expect(parsed.sections.map((s) => s.name).filter((s) => !['DECKS', 'CARDS', 'RECORDS'].includes(s))).toEqual([], 'R-13');
                    });

                    it('indexes in CARDS exactly the card ids it mentions', function () {
                        const header = headerOf(parsed);
                        const mentioned = new Set<string>();
                        for (const tag of ['P1Leader', 'P2Leader', 'P1Base', 'P2Base']) {
                            header[tag].split(',').forEach((id) => mentioned.add(id));
                        }
                        for (const d of jsonLines(parsed, 'DECKS').map((l) => l.value)) {
                            (d.leaders as string[]).forEach((id) => mentioned.add(id));
                            mentioned.add(d.base as string);
                            for (const list of [d.main, d.sideboard] as (unknown[][] | undefined)[]) {
                                (list ?? []).forEach((m) => mentioned.add(m[0] as string));
                            }
                        }
                        for (const r of jsonLines(parsed, 'RECORDS').map((l) => l.value)) {
                            if (typeof r.card === 'string') {
                                mentioned.add(r.card);
                            }
                            const copyOf = (r.a as Json | undefined)?.copyOf;
                            if (typeof copyOf === 'string') {
                                mentioned.add(copyOf);
                            }
                        }
                        const indexed = jsonLines(parsed, 'CARDS').map((l) => l.value.id as string);
                        expect(new Set(indexed).size).toBe(indexed.length);
                        expect([...indexed].sort()).toEqual([...mentioned].sort());
                    });

                    it('writes every block by its kind\'s field contract (W-64, V-16)', function () {
                        const fields = ['p', 'src', 'targets', 'options', 'amount', 'via', 'group', 'text'] as const;
                        for (const l of jsonLines(parsed, 'RECORDS').filter((x) => x.value.t === 'block')) {
                            const kind = BLOCK_KINDS.find((k) => k.name === l.value.kind);
                            expect(kind).toBeDefined(`${file}:${l.line}: every vector block has a registered kind`);
                            if (!kind) {
                                continue;
                            }
                            for (const field of fields) {
                                const rule = kind.fields[field];
                                const present = l.value[field] !== undefined;
                                if (present && !rule && field !== 'text') {
                                    fail(`${file}:${l.line}: ${kind.name} does not list ${field}`);
                                }
                                const dropped = profile !== 'full' && (BLOCK_REFERENCE_FIELDS as readonly string[]).includes(field);
                                if (rule?.use === 'required' && !present && !dropped) {
                                    fail(`${file}:${l.line}: ${kind.name} requires ${field}`);
                                }
                            }
                        }
                    });

                    it('has a board.json at its last step', function () {
                        const board = JSON.parse(fs.readFileSync(path.join(vectorsDir, `${vector.name}.${profile}.board.json`), 'utf8'));
                        const fn = validator('board');
                        expect(fn(board)).toBe(true, JSON.stringify(fn.errors));
                        const steps = jsonLines(parsed, 'RECORDS').filter((l) => l.value.t === 'step');
                        expect(board.seq).toBe(steps[steps.length - 1].value.seq);
                        for (const id of ['g', 'p1', 'p2']) {
                            expect(board.entities[id]).toBeDefined();
                        }
                    });

                    it('applies to its board.json', function () {
                        pending('Task 6: the SDK applier');
                    });

                    if (profile !== 'full') {
                        it(`is what redacting ${vector.name}.full gives`, function () {
                            pending('Task 8: the SDK redactor');
                        });
                    }
                });
            }

            if (vector.identical) {
                const other = vector.identical.with;
                for (const profile of vector.identical.profiles) {
                    it(`${profile} is byte-identical to ${other}.${profile}, file and board`, function () {
                        for (const suffix of ['swupgn', 'board.json']) {
                            const mine = fs.readFileSync(path.join(vectorsDir, `${vector.name}.${profile}.${suffix}`), 'utf8');
                            const theirs = fs.readFileSync(path.join(vectorsDir, `${other}.${profile}.${suffix}`), 'utf8');
                            expect(mine === theirs).toBe(true, `${vector.name}.${profile}.${suffix} differs from ${other}.${profile}.${suffix}`);
                        }
                    });
                }
                it(`its full file differs from ${other}.full`, function () {
                    const mine = fs.readFileSync(path.join(vectorsDir, `${vector.name}.full.swupgn`), 'utf8');
                    const theirs = fs.readFileSync(path.join(vectorsDir, `${other}.full.swupgn`), 'utf8');
                    expect(mine === theirs).toBe(false);
                });
            }
        });
    }

    describe('negative', function () {
        /**
         * Codes no file is required to produce: the limits of SPEC §20 are a reader's own choice
         * ([P-23] and [A-19] say MAY, and give no normative values), so a conforming reader with
         * larger caps accepts the same file.
         */
        const READER_LIMITS = ['too-large', 'line-too-long', 'too-many-records', 'too-deep'];

        it('has one file for every error and fatal code a file can carry, except reader limits', function () {
            const fileCodes = ERROR_CODES.filter((c) => c.severity !== 'warning' && c.scope !== 'api').map((c) => c.code);
            const listed = manifest.negative.map((n) => n.code);
            expect([...listed].sort()).toEqual(fileCodes.filter((c) => !READER_LIMITS.includes(c)).sort());
            for (const code of READER_LIMITS) {
                expect(fileCodes).toContain(code);
            }
        });

        for (const n of manifest.negative) {
            it(`${n.file} exists and names its line for ${n.code}`, function () {
                const code = ERROR_CODES.find((c) => c.code === n.code);
                expect(code?.severity).not.toBe('warning');
                expect(n.file).toBe(`negative/${n.code}.swupgn`);
                const text = fs.readFileSync(path.join(vectorsDir, n.file), 'utf8');
                const lines = text.split('\n');
                expect(Number.isInteger(n.line) && n.line >= 1 && n.line < lines.length).toBe(true);
                expect(lines[n.line - 1].trim()).not.toBe('');
            });
        }

        it('block-fields: the negative block lacks a field its contract requires, in a full file', function () {
            const n = manifest.negative.find((x) => x.code === 'block-fields') as ManifestNegative;
            const lines = fs.readFileSync(path.join(vectorsDir, n.file), 'utf8').split('\n');
            expect(lines).toContain('[Visibility "full"]');
            const block = JSON.parse(lines[n.line - 1]);
            const kind = BLOCK_KINDS.find((k) => k.name === block.kind);
            const missing = Object.entries(kind?.fields ?? {}).filter(([f, rule]) => rule?.use === 'required' && block[f] === undefined)
                .map(([f]) => f);
            expect(missing).toEqual(['targets']);
        });
    });
});
