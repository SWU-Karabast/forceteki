import Ajv2020 from 'ajv/dist/2020.js';
import type { ErrorObject, ValidateFunction } from 'ajv';
import { SwuPgnError } from '../errors.js';
import { fileLinesOf, parse } from '../parse.js';
import type { ParseLimits } from '../parse.js';
import { schema } from '../generated/schema.js';
import { ERROR_CODES } from '../registry.js';
import { Collector } from './issues.js';
import type { Issue, ValidationReport } from './issues.js';
import { checkCardIndex, checkProfile } from './profile.js';
import { checkRecords, isObject, reportSchema, unsafeNumberPaths } from './structural.js';

export type { Issue, Level, ValidationReport } from './issues.js';

export interface ValidateOptions {
    limits?: ParseLimits;

    /** Issues listed before `too-many-issues` ([V-13]). At least 1000 by default; the level counts them all. */
    maxIssues?: number;
}

const DEFAULT_MAX_ISSUES = 1000;
const FATAL_CODES: ReadonlySet<string> = new Set(ERROR_CODES.filter((c) => c.severity === 'fatal' && c.scope !== 'api').map((c) => c.code));

const compiled = new Map<string, ValidateFunction>();
let ajv: Ajv2020 | undefined;

function schemaCheck(def: string, value: unknown): ErrorObject[] {
    let fn = compiled.get(def);
    if (!fn) {
        if (!ajv) {
            ajv = new Ajv2020({ strict: true, allErrors: true });
            ajv.addSchema(schema as object);
        }
        const found = ajv.getSchema(`urn:swupgn:0.1#/$defs/${def}`);
        if (!found) {
            throw new Error(`the schema has no $defs/${def}`);
        }
        fn = found;
        compiled.set(def, fn);
    }
    return fn(value) ? [] : [...(fn.errors ?? [])];
}

function fatal(e: unknown): Issue {
    if (e instanceof SwuPgnError && FATAL_CODES.has(e.code)) {
        return { code: e.code, severity: 'fatal', ...(e.line !== undefined ? { line: e.line } : {}), message: e.message };
    }
    // Not a parse error: report the nearest fatal code rather than fail ([V-02]).
    const stack = e instanceof RangeError;
    return { code: stack ? 'too-deep' : 'bad-json', severity: 'fatal', message: e instanceof Error ? e.message : String(e) };
}

/**
 * Validate a `.swupgn` text (SPEC 9.5). Never throws. A file `parse` rejects is `malformed` with
 * that one issue; otherwise every rule is checked and checking continues past each issue.
 */
export function validate(text: string, options: ValidateOptions = {}): ValidationReport {
    const out = new Collector(options.maxIssues ?? DEFAULT_MAX_ISSUES);
    try {
        const file = parse(text, options.limits);
        const lines = fileLinesOf(file);
        if (!lines) {
            throw new Error('the parser kept no line index');
        }

        // Header: the schema, then the tags the validator reads ([V-03], [V-12]).
        const headerErrors = schemaCheck('header', file.header);
        const byTag = new Map<string, ErrorObject[]>();
        for (const e of headerErrors) {
            const tag = e.instancePath.split('/')[1];
            byTag.set(tag ?? '', [...(byTag.get(tag ?? '') ?? []), e]);
        }
        for (const [tag, errors] of byTag) {
            reportSchema(out, lines.tags.get(tag) ?? lines.headerEnd, errors, file.header);
        }
        const minor = (/^SWU-PGN\/0\.(\d+)$/).exec(file.header.Game);
        if (minor && Number(minor[1]) > 1) {
            out.add('newer-minor', lines.tags.get('Game'), `${file.header.Game} is newer than SWU-PGN/0.1`);
        }
        if (file.header.WriterErrors !== undefined && Number(file.header.WriterErrors) > 0) {
            out.add('writer-errors', lines.tags.get('WriterErrors'), `the writer reported ${file.header.WriterErrors} errors`);
        }

        // DECKS ([V-10]) and CARDS ([V-09]).
        const seats = new Map<unknown, number>();
        file.decks.forEach((d, i) => {
            const line = lines.decks[i];
            const deck = d as unknown;
            if (!isObject(deck)) {
                out.add('not-object', line, 'a DECKS line must be a JSON object');
                return;
            }
            if (unsafeNumberPaths(deck).length > 0) {
                out.add('number-range', line, 'a number is not an integer within +-(2^53-1)');
            }
            const errors = schemaCheck('deckLine', deck);
            if (errors.length > 0) {
                reportSchema(out, line, errors, deck);
            } else {
                const counted = Array.isArray(deck.main) ? (deck.main as unknown[]).map((m) => Array.isArray(m) && m.length === 2) : [];
                const want = deck.complete === true;
                if (counted.some((c) => c !== want) || (!want && deck.sideboard !== undefined)) {
                    out.add('schema', line, want ? 'a complete deck needs a count on every main entry' : 'a partial deck has no counts and no sideboard');
                }
            }
            if (seats.has(deck.p)) {
                out.add('schema', line, `DECKS has a second line for seat ${String(deck.p)}`);
            }
            seats.set(deck.p, i);
        });
        if (lines.banners.has('DECKS') && !(seats.has(1) && seats.has(2))) {
            out.add('schema', lines.banners.get('DECKS'), 'DECKS needs one line for each seat');
        }
        file.cards.forEach((c, i) => {
            const line = lines.cards[i];
            const card = c as unknown;
            if (!isObject(card)) {
                out.add('not-object', line, 'a CARDS line must be a JSON object');
                return;
            }
            if (unsafeNumberPaths(card).length > 0) {
                out.add('number-range', line, 'a number is not an integer within +-(2^53-1)');
            }
            const indexBad = typeof card.id !== 'string' || typeof card.name !== 'string';
            if (indexBad) {
                out.add('card-index', line, 'a CARDS line needs a string id and a string name');
            }
            const errors = schemaCheck('cardLine', card);
            if (errors.length > 0) {
                reportSchema(out, line, errors, card, (e) => indexBad && (e.instancePath === '/id' || e.instancePath === '/name' ||
                  (e.keyword === 'required' && ['id', 'name'].includes((e.params as { missingProperty?: string }).missingProperty ?? ''))));
            }
        });

        // RECORDS ([V-04] to [V-07], [V-14], [V-16], [V-12] unknown-type).
        const { steps, result } = checkRecords(file, lines, out, schemaCheck);
        checkCardIndex(file, lines, out);
        checkProfile(file, lines, out);

        // Result ([V-11]).
        const expected: Record<string, unknown> = { P1: 'p1', P2: 'p2', Draw: 'draw', Incomplete: undefined };
        const tag = file.header.Result;
        if (!Object.prototype.hasOwnProperty.call(expected, tag) || expected[tag] !== result) {
            out.add('result-mismatch', lines.tags.get('Result'), `Result ${tag} disagrees with the game result ${result === undefined ? '(none)' : JSON.stringify(result)}`);
        }

        // ANNOTATIONS and sections ([V-03], [V-12]).
        file.annotations.forEach((a, i) => {
            const line = lines.annotations[i];
            const ann = a as unknown;
            if (!isObject(ann)) {
                out.add('not-object', line, 'an ANNOTATIONS line must be a JSON object');
                return;
            }
            if (unsafeNumberPaths(ann).length > 0) {
                out.add('number-range', line, 'a number is not an integer within +-(2^53-1)');
            }
            const errors = schemaCheck('annotation', ann);
            if (errors.length > 0) {
                reportSchema(out, line, errors, ann);
            } else if (typeof ann.seq === 'number' && Number.isSafeInteger(ann.seq) && !steps.has(ann.seq)) {
                out.add('dangling-annotation', line, `annotation names step ${ann.seq}, which the file does not have`);
            }
        });
        file.unknownSections.forEach((s, i) => {
            if (!s.name.startsWith('X_')) {
                out.add('unknown-section', lines.unknownBanners[i], `section ${s.name} is not known to this version`);
            }
        });
    } catch (e) {
        const f = fatal(e);
        out.add(f.code, f.line, f.message);
    }
    return out.report();
}
