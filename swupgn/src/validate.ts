import Ajv from 'ajv/dist/2020';
import type { ErrorObject } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import type { ConformanceReport, ConformanceIssue } from './types';
import { KNOWN_SECTIONS, parse, SwuPgnError } from './parse';
import { checkKeyframes } from './integrity';
import { MAX_ZONE_LIST } from './fold';

// Schemas are loaded at runtime from the published swupgn/schema directory.
// This path is relative to the compiled output (build/swupgn/src/validate.js):
// up three levels reaches the repo root, then swupgn/schema. If this module is
// ever extracted to a standalone package, bundle the schema files alongside it
// and adjust this path.
const SCHEMA_DIR = path.resolve(__dirname, '../../../swupgn/schema');
function loadSchema(name: string): object {
    return JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), 'utf8')) as object;
}

// Compile validators once at module load to avoid re-compilation on every call.
const ajv = new Ajv({ allErrors: true, strict: false });
const vHeader = ajv.compile(loadSchema('header.schema.json'));
const vDeck = ajv.compile(loadSchema('deck.schema.json'));
const vEvent = ajv.compile(loadSchema('event.schema.json'));
const vAnn = ajv.compile(loadSchema('annotation.schema.json'));

const KNOWN_EVENT_TYPES = new Set([
    'PLAY', 'PLAY_EVENT', 'PLAY_UPGRADE', 'PLAY_SMUGGLE', 'DEPLOY_LEADER', 'ATTACK', 'PASS',
    'CLAIM_INITIATIVE', 'CHOICE', 'MULLIGAN', 'KEEP_HAND', 'MODAL_CHOICE', 'ABILITY_ACTIVATE',
    'DAMAGE', 'HEAL', 'DEFEAT', 'EXHAUST', 'READY', 'DRAW', 'DISCARD', 'RESOURCE', 'SHUFFLE',
    'EXHAUST_RESOURCES', 'READY_RESOURCES', 'STATS', 'LEADER_FLIP',
    'CREATE_TOKEN', 'MOVE', 'CAPTURE', 'RESCUE', 'TAKE_CONTROL', 'SHIELD_GAIN', 'SHIELD_USE',
    'EXPERIENCE_GAIN', 'STATUS_TOKEN', 'OVERWHELM', 'SEARCH', 'REVEAL', 'TRIGGER',
    'PHASE_START', 'PHASE_END', 'ROUND_START', 'ROUND_END', 'GAME_END', 'INIT', 'UNDO',
]);

/** The minor version this reader implements (`SWU-PGN/1.<minor>`). */
export const READER_MINOR = 0;

/** Spec §6.2: the complete zone vocabulary. */
export const ZONES: readonly string[] = ['deck', 'hand', 'resource', 'ground', 'space', 'discard', 'base', 'outsideTheGame', 'capture'];
const ARENAS = new Set(['ground', 'space']);

/** Keys a reader MUST NOT treat as ordinary map keys (spec §17.1): they name the object model. */
const RESERVED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * A record line that is not a JSON object at all (`null`, a number, a bare array).
 *
 * These reach us straight from an untrusted file, and the old loops read `rec['seq']` before
 * the schema ever ran -- so a single `null` line under `%%% EVENTS` threw
 * "Cannot read properties of null" out of the validator itself, turning "tell me if this file
 * is conformant" into a crash. Report it as the error it is and move on.
 */
function asRecord(rec: unknown): Record<string, unknown> | null {
    return typeof rec === 'object' && rec !== null && !Array.isArray(rec)
        ? rec as Record<string, unknown>
        : null;
}

/** First reserved key or out-of-range number anywhere inside `value`, as an issue message. */
function walkValues(value: unknown, where: string): { code: string; message: string } | null {
    if (typeof value === 'number') {
        return Number.isSafeInteger(value) ? null : { code: 'number-range', message: `${where}: ${value} is not an integer in ±(2^53−1)` };
    }
    if (typeof value !== 'object' || value === null) {
        return null;
    }
    if (Array.isArray(value)) {
        for (const v of value) {
            const found = walkValues(v, where);
            if (found) {
                return found;
            }
        }
        return null;
    }
    for (const key of Object.keys(value)) {
        if (RESERVED_KEYS.has(key)) {
            return { code: 'reserved-key', message: `${where}: reserved key "${key}"` };
        }
        const found = walkValues((value as Record<string, unknown>)[key], where);
        if (found) {
            return found;
        }
    }
    return null;
}

/** The `N` of `SWU-PGN/1.N`, or null. */
function minorOf(game: unknown): number | null {
    const m = typeof game === 'string' ? (/^SWU-PGN\/1\.(\d+)$/).exec(game) : null;
    return m ? Number(m[1]) : null;
}

export function validate(text: string): ConformanceReport {
    const issues: ConformanceIssue[] = [];
    let formatVersion: string | null = null;
    const error = (code: string, message: string) => issues.push({ severity: 'error', code, message });
    const warn = (code: string, message: string) => issues.push({ severity: 'warning', code, message });

    let doc;
    try {
        doc = parse(text);
        formatVersion = doc.header.game ?? null;
    } catch (e) {
        issues.push({ severity: 'error', code: e instanceof SwuPgnError ? e.code : 'malformed', message: (e as Error).message, ...(e instanceof SwuPgnError && e.line ? { line: e.line } : {}) });
        return { valid: false, level: 'malformed', formatVersion, issues };
    }

    // §18: a file from a later minor version may use values this reader has never seen in a
    // closed vocabulary. Those are the newer writer's business, so they are warnings here, not
    // errors -- otherwise every 1.0 validator would reject every 1.1 file.
    const minor = minorOf(doc.header.game);
    const newer = minor !== null && minor > READER_MINOR;
    if (newer) {
        warn('newer-minor', `file is ${doc.header.game}, newer than this reader (SWU-PGN/1.${READER_MINOR}); unknown things are skipped`);
    }
    const schemaIssues = (errors: ErrorObject[] | null | undefined, where: string) => {
        for (const err of errors ?? []) {
            // An `if`/`then` branch reports "must match then schema" beside the error inside it,
            // which carries the field. Reporting both is noise, and in a newer file would turn
            // a downgraded value back into an error.
            if (err.keyword === 'if') {
                continue;
            }
            if (newer && err.keyword === 'enum') {
                warn('unknown-value', `${where}${err.instancePath} has a value this reader does not know`);
            } else {
                error('schema', `${where}${err.instancePath} ${err.message}`);
            }
        }
    };

    const headerObj: Record<string, unknown> = {
        Game: doc.header.game, GameId: doc.header.gameId, Date: doc.header.date,
        CardPool: doc.header.cardPool, Engine: doc.header.engine, Seed: doc.header.seed,
        Perspective: doc.header.perspective ?? undefined,
        P1Id: doc.header.p1Id, P2Id: doc.header.p2Id, P1: doc.header.p1, P2: doc.header.p2,
        P1Leader: doc.header.p1Leader, P1Base: doc.header.p1Base,
        P2Leader: doc.header.p2Leader, P2Base: doc.header.p2Base,
        Result: doc.header.result, Reason: doc.header.reason, Rounds: doc.header.rounds,
        ...(doc.header.format !== undefined ? { Format: doc.header.format } : {}),
        ...(doc.header.recorderErrors !== undefined ? { RecorderErrors: doc.header.recorderErrors } : {}),
        ...(doc.header.undos !== undefined ? { Undos: doc.header.undos } : {}),
        ...(doc.header.writerRevision !== undefined ? { WriterRevision: doc.header.writerRevision } : {}),
        ...(doc.header.endDate !== undefined ? { EndDate: doc.header.endDate } : {}),
        ...(doc.header.match !== undefined ? { Match: doc.header.match } : {}),
        ...(doc.header.gameNumber !== undefined ? { GameNumber: doc.header.gameNumber } : {}),
    };
    if (!vHeader(headerObj)) {
        schemaIssues(vHeader.errors, 'header');
    }
    // §22: a file with no WriterRevision predates SWU-PGN/1.0 as published. Readers still read
    // it (Appendix C), but it is not a conformant 1.0 file.
    const preRelease = doc.header.writerRevision === undefined;
    if (preRelease) {
        warn('pre-release', 'no [WriterRevision] tag: a pre-release file (Appendix C), not conformant SWU-PGN/1.0');
    }

    for (const d of doc.decks) {
        if (!asRecord(d)) {
            error('not-object', 'deck record is not a JSON object');
        } else if (!vDeck(d)) {
            schemaIssues(vDeck.errors, 'deck ');
        }
    }

    for (const c of doc.cards ?? []) {
        const card = asRecord(c);
        if (!card || typeof card['id'] !== 'string' || typeof card['name'] !== 'string') {
            error('card-index', 'card index entry must be an object with a string id and name');
        }
    }

    // One pass over SETUP then EVENTS: per-record schema, then the cross-record rules that a
    // schema cannot state (§3, "valid").
    const seqs = new Set<string>();
    const records: Record<string, unknown>[] = [];
    for (const [label, list] of [['setup', doc.setup], ['event', doc.events]] as const) {
        for (const rec of list) {
            const r = asRecord(rec);
            if (!r) {
                error('not-object', `${label} record is not a JSON object`);
                continue;
            }
            const seqStr = String(r['seq'] ?? '');
            const tStr = String(r['t'] ?? '');
            if (!vEvent(r)) {
                schemaIssues(vEvent.errors, `${label} ${seqStr} `);
            }
            // `X_` types are extensions (§18): skipped without a word.
            if (!KNOWN_EVENT_TYPES.has(tStr) && !tStr.startsWith('X_')) {
                warn('unknown-type', `${label} ${seqStr} unknown type "${tStr}" (skipped)`);
            }
            if (seqs.has(seqStr)) {
                error('duplicate-seq', `${label} ${seqStr}: seq appears twice`);
            }
            seqs.add(seqStr);
            records.push(r);
        }
    }
    for (const r of records) {
        const seqStr = String(r['seq'] ?? '');
        const walked = walkValues(r, `record ${seqStr}`);
        if (walked) {
            error(walked.code, walked.message);
        }
        if (typeof r['for'] === 'string' && !seqs.has(r['for'])) {
            error('dangling-ref', `record ${seqStr}: for "${r['for']}" names no record`);
        }
        if (typeof r['zone'] === 'string' && !ZONES.includes(r['zone'])) {
            error('bad-zone', `record ${seqStr}: zone "${r['zone']}" is not a zone`);
        }
        if (r['t'] === 'MOVE') {
            for (const k of ['from', 'to']) {
                if (typeof r[k] === 'string' && !ZONES.includes(r[k] as string)) {
                    error('bad-zone', `record ${seqStr}: ${k} "${r[k] as string}" is not a zone`);
                }
            }
            // Only an arena may be both ends of a move: an attachment changing in place (§10.1).
            if (r['from'] === r['to'] && !ARENAS.has(String(r['from']))) {
                error('same-zone-move', `record ${seqStr}: MOVE from ${String(r['from'])} to itself`);
            }
        }
        const kf = asRecord(r['keyframe']);
        const players = kf ? asRecord(kf['players']) : null;
        for (const ps of Object.values(players ?? {})) {
            const seat = asRecord(ps) ?? {};
            const lists: unknown[] = ['cards', 'hand', 'discard', 'resources', 'baseUpgrades', 'baseCaptured'].map((k) => seat[k]);
            for (const c of Array.isArray(seat['cards']) ? seat['cards'] : []) {
                const card = asRecord(c) ?? {};
                lists.push(card['upgrades'], card['captured']);
                if (typeof card['zone'] === 'string' && !ZONES.includes(card['zone'])) {
                    error('bad-zone', `record ${seqStr}: keyframe card zone "${card['zone']}" is not a zone`);
                }
            }
            // §17.1: no real board comes near it, and a reader that holds the list would
            // otherwise grow without bound on a hostile file (the fold refuses such a keyframe).
            if (lists.some((l) => Array.isArray(l) && l.length > MAX_ZONE_LIST)) {
                error('over-cap', `record ${seqStr}: a keyframe list is longer than ${MAX_ZONE_LIST}`);
            }
        }
    }

    // parse() IGNORES a section it does not recognise, because §18 makes that a later version's
    // business rather than a broken file. That is right for forward compatibility and wrong for
    // a typo: `%%% EVENT` would otherwise parse perfectly into zero events and say nothing. The
    // banner is reported here the same way an unknown event `t` is -- a warning, never an error.
    for (const [i, line] of text.split('\n').entries()) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('%%%')) {
            continue;
        }
        const name = trimmed.slice(3).trim()
            .toUpperCase();
        if (!KNOWN_SECTIONS.includes(name) && !name.startsWith('X_')) {
            issues.push({ severity: 'warning', code: 'unknown-section', line: i + 1, message: `line ${i + 1}: unknown section "%%% ${name}" — its records were skipped (tolerated for forward compatibility)` });
        }
    }

    const noteIds = new Set<string>();
    for (const a of doc.annotations) {
        const id = asRecord(a)?.['id'];
        if (typeof id === 'string') {
            noteIds.add(id);
        }
    }
    for (const a of doc.annotations) {
        const ann = asRecord(a);
        if (!ann) {
            error('not-object', 'annotation record is not a JSON object');
            continue;
        }
        if (!vAnn(ann)) {
            schemaIssues(vAnn.errors, 'annotation ');
            continue;
        }
        const walked = walkValues(ann, `annotation on ${String(ann['ref'])}`);
        if (walked) {
            error(walked.code, walked.message);
        }
        if (!seqs.has(ann['ref'] as string)) {
            error('dangling-ref', `annotation ref "${String(ann['ref'])}" names no record`);
        }
        // §15: a reply whose parent is gone is shown as a top-level note, not dropped.
        if (typeof ann['parent'] === 'string' && !noteIds.has(ann['parent'])) {
            warn('dangling-parent', `annotation parent "${ann['parent']}" names no annotation id; shown as a top-level note`);
        }
    }

    const hasErrors = issues.some((i) => i.severity === 'error');
    if (hasErrors || preRelease) {
        return { valid: !hasErrors, level: 'well-formed', formatVersion, issues };
    }

    // verified: the stream accounts for every keyframe (§14). complete: and the writer lost
    // nothing it knows of. Neither is an error: §14 lets a writer ship a file that fails the
    // gate, because the keyframes stay authoritative.
    const integrity = checkKeyframes(doc.events);
    if (!integrity.ok) {
        warn('keyframe-mismatch', `${integrity.mismatches.length} keyframe mismatch(es), first at ${integrity.mismatches[0]?.seq ?? '?'}`);
        return { valid: true, level: 'valid', formatVersion, issues };
    }
    const unknownDefeats = doc.events.filter((e) => asRecord(e)?.['t'] === 'DEFEAT' && asRecord(e)?.['reason'] === 'unknown').length;
    if ((doc.header.recorderErrors ?? 0) > 0 || unknownDefeats > 0) {
        if ((doc.header.recorderErrors ?? 0) > 0) {
            warn('recorder-errors', `[RecorderErrors "${doc.header.recorderErrors}"]: the writer lost records`);
        }
        if (unknownDefeats > 0) {
            warn('unknown-defeat', `${unknownDefeats} DEFEAT record(s) with reason "unknown"`);
        }
        return { valid: true, level: 'verified', formatVersion, issues };
    }
    return { valid: true, level: 'complete', formatVersion, issues };
}
