import Ajv from 'ajv/dist/2020';
import type { ErrorObject } from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import type { ConformanceReport, ConformanceIssue, ConformanceLevel } from './types';
import { engineProduct, KNOWN_SECTIONS, parse, PILOT_WRITER_PRODUCTS, SwuPgnError } from './parse';
import { checkKeyframes } from './integrity';
import { isArena, MAX_ZONE_LIST } from './fold';
import { TOKEN_ID, TOKEN_NAME, tokenNameOf } from './ids';

// Schemas are loaded at runtime from the published swupgn/schema directory.
// This path is relative to the compiled output (build/swupgn/src/validate.js):
// up three levels reaches the repo root, then swupgn/schema. If this module is
// ever extracted to a standalone package, bundle the schema files alongside it
// and adjust this path.
const SCHEMA_DIR = path.resolve(__dirname, '../../../swupgn/schema');
function loadSchema(name: string): object {
    return JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), 'utf8')) as object;
}

// Compile validators once at module load to avoid re-compilation on every call. `verbose` puts
// the failing value on each error, which the newer-minor downgrade needs to see.
const ajv = new Ajv({ allErrors: true, strict: false, verbose: true });
const eventSchema = loadSchema('event.schema.json');
const vHeader = ajv.compile(loadSchema('header.schema.json'));
const vDeck = ajv.compile(loadSchema('deck.schema.json'));
const vEvent = ajv.compile(eventSchema);
const vAnn = ajv.compile(loadSchema('annotation.schema.json'));

interface SchemaBranch {
    if?: { properties?: { t?: { const?: string } } };
    then?: { properties?: { reason?: { enum?: string[] } } };
}

/**
 * This version's closed `DEFEAT.reason` vocabulary (§6.4), read from the event schema so there is
 * one copy. A reason outside it reads as `unknown` (§18).
 */
const DEFEAT_REASONS: ReadonlySet<string> = new Set(
    ((eventSchema as { allOf?: SchemaBranch[] }).allOf ?? [])
        .find((b) => b.if?.properties?.t?.const === 'DEFEAT')?.then?.properties?.reason?.enum ?? []
);
// If the schema's shape changes, an empty set would read every DEFEAT as unknown and quietly cap
// every file at verified. Fail loudly at load instead.
if (!DEFEAT_REASONS.has('unknown')) {
    throw new Error('validate: could not read the DEFEAT reason vocabulary from event.schema.json');
}

/**
 * Whether a header value names a seat (§18: seats never grow in a minor version). `Perspective`
 * holds only seats. `Result` also holds outcomes (`Draw`, `Incomplete`), and a minor version may
 * add an outcome, so only its `P<n>` values are seats.
 */
function isHeaderSeat(path: string, value: unknown): boolean {
    return path === '/Perspective' || (path === '/Result' && typeof value === 'string' && (/^P\d+$/).test(value));
}

/**
 * How many issues a validator lists before it stops (§24). A hostile file can break a rule on
 * every one of a million records; the level still counts every issue, the list does not hold them.
 */
export const MAX_ISSUES = 1000;

const KNOWN_EVENT_TYPES = new Set([
    'PLAY', 'PLAY_EVENT', 'PLAY_UPGRADE', 'PLAY_SMUGGLE', 'DEPLOY_LEADER', 'ATTACK', 'PASS',
    'CLAIM_INITIATIVE', 'CHOICE', 'MULLIGAN', 'KEEP_HAND', 'MODAL_CHOICE', 'ABILITY_ACTIVATE',
    'DAMAGE', 'HEAL', 'DEFEAT', 'EXHAUST', 'READY', 'DRAW', 'DISCARD', 'RESOURCE', 'SHUFFLE',
    'EXHAUST_RESOURCES', 'READY_RESOURCES', 'STATS', 'LEADER_FLIP',
    'CREATE_TOKEN', 'MOVE', 'CAPTURE', 'RESCUE', 'TAKE_CONTROL', 'SHIELD_GAIN', 'SHIELD_USE',
    'EXPERIENCE_GAIN', 'STATUS_TOKEN', 'OVERWHELM', 'SEARCH', 'REVEAL', 'TRIGGER',
    'PHASE_START', 'PHASE_END', 'ROUND_START', 'ROUND_END', 'GAME_END', 'INIT', 'UNDO',
    'EFFECT_START', 'EFFECT_END', 'LOOK', 'NAME', 'ABILITY_RESET',
]);

/** The minor version this reader implements (`SWU-PGN/1.<minor>`). */
export const READER_MINOR = 0;

/** Spec §6.2: the complete zone vocabulary. */
export const ZONES: readonly string[] = ['deck', 'hand', 'resource', 'ground', 'space', 'discard', 'base', 'outsideTheGame', 'capture'];

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

/**
 * First out-of-range number anywhere inside `value`, as an issue message. Reserved keys never get
 * this far: the parser rejects a record that carries one (spec §23).
 */
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
        const found = walkValues((value as Record<string, unknown>)[key], where);
        if (found) {
            return found;
        }
    }
    return null;
}

/**
 * First string anywhere inside `value` that starts with `TOKEN:` and breaks the token id grammar
 * (§6.1), or undefined.
 */
function badTokenRef(value: unknown): string | undefined {
    if (typeof value === 'string') {
        return value.startsWith('TOKEN:') && !TOKEN_ID.test(value) ? value : undefined;
    }
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    for (const v of Array.isArray(value) ? value : Object.values(value)) {
        const found = badTokenRef(v);
        if (found !== undefined) {
            return found;
        }
    }
    return undefined;
}

/** The `N` of `SWU-PGN/1.N`, or null. */
function minorOf(game: unknown): number | null {
    const m = typeof game === 'string' ? (/^SWU-PGN\/1\.(\d+)$/).exec(game) : null;
    return m ? Number(m[1]) : null;
}

/** The level each warning caps a file at (§24 "Level at most"); a warning not listed caps nothing. */
const WARNING_CAP: Readonly<Record<string, ConformanceLevel>> = {
    'pre-release': 'well-formed',
    'keyframe-mismatch': 'valid',
    'recorder-errors': 'verified',
    'unknown-defeat': 'verified',
};

export function validate(text: string): ConformanceReport {
    const issues: ConformanceIssue[] = [];
    // Every code reported, listed or not: the level comes from these, never from the capped list.
    const seen = new Set<string>();
    let hasErrors = false;
    let formatVersion: string | null = null;
    const add = (issue: ConformanceIssue) => {
        seen.add(issue.code);
        if (issue.severity === 'error') {
            hasErrors = true;
        }
        if (issues.length < MAX_ISSUES) {
            issues.push(issue);
        } else if (issues.length === MAX_ISSUES) {
            issues.push({ severity: 'warning', code: 'too-many-issues', message: `stopped listing issues after ${MAX_ISSUES}; the level still counts every one` });
        }
    };
    const error = (code: string, message: string) => add({ severity: 'error', code, message });
    const warn = (code: string, message: string) => add({ severity: 'warning', code, message });

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
            // The one required `active` is on ROUND_START, which has a named error of its own.
            if (err.keyword === 'required' && (err.params as { missingProperty?: string }).missingProperty === 'active') {
                continue;
            }
            // Only a vocabulary of names may grow in a minor version, and only by more names. A
            // seat may not (§18), so `"p":3` and `[Result "P3"]` stay errors in a file of any minor
            // version; nor may a value change type, so `"reason":5` stays one too.
            const allowed = (err.params as { allowedValues?: unknown[] }).allowedValues;
            const namesOnly = allowed?.every((v) => typeof v === 'string') ?? false;
            const seat = where === 'header' && isHeaderSeat(err.instancePath, err.data);
            const growable = err.keyword === 'enum' && typeof err.data === 'string' && namesOnly && !seat;
            if (newer && growable) {
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
    // WriterRevision is optional and diagnostic. The §25 pilot writer registry names the writers
    // whose files without it predate the published spec: read, but not as conformant SWU-PGN/1.0.
    const preRelease = doc.header.writerRevision === undefined && PILOT_WRITER_PRODUCTS.has(engineProduct(doc.header.engine));
    if (preRelease) {
        warn('pre-release', 'no [WriterRevision] tag from a pilot writer (§25): a pre-release file, not conformant SWU-PGN/1.0');
    }

    // Cross-record rule 5 holds for every record, DECKS and CARDS included: a deck record is
    // open (§7), so its schema no longer rejects an unknown key on its own.
    for (const d of doc.decks) {
        if (!asRecord(d)) {
            error('not-object', 'deck record is not a JSON object');
            continue;
        }
        if (!vDeck(d)) {
            schemaIssues(vDeck.errors, 'deck ');
        }
        const walked = walkValues(d, 'deck record');
        if (walked) {
            error(walked.code, walked.message);
        }
        const badDeckToken = badTokenRef(d);
        if (badDeckToken !== undefined) {
            error('bad-token-name', `deck record: "${badDeckToken}" breaks the token id grammar`);
        }
    }

    for (const c of doc.cards ?? []) {
        const card = asRecord(c);
        if (!card || typeof card['id'] !== 'string' || typeof card['name'] !== 'string') {
            error('card-index', 'card index entry must be an object with a string id and name');
        }
        const walked = card ? walkValues(card, 'card index entry') : null;
        if (walked) {
            error(walked.code, walked.message);
        }
        const badCardToken = card ? badTokenRef(card) : undefined;
        if (badCardToken !== undefined) {
            error('bad-token-name', `card index entry: "${badCardToken}" breaks the token id grammar`);
        }
    }

    // One pass over SETUP then EVENTS: per-record schema, then the cross-record rules that a
    // schema cannot state (§2.1, "valid").
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
    // The effects active at each record, by id, with the targets each still has (null: an effect
    // with no targets). Followed in file order, as the fold does ([V-09]).
    const activeEffects = new Map<string, Set<string> | null>();
    const strings = (x: unknown): string[] => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);
    for (const r of records) {
        const seqStr = String(r['seq'] ?? '');
        if (r['t'] === 'EFFECT_START' && typeof r['id'] === 'string') {
            activeEffects.set(r['id'], Array.isArray(r['targets']) ? new Set(strings(r['targets'])) : null);
        }
        if (r['t'] === 'EFFECT_END' && typeof r['id'] === 'string') {
            const id = r['id'];
            const held = activeEffects.get(id);
            const gone = strings(r['targets']);
            if (held === undefined) {
                error('effect-end-unknown', `record ${seqStr}: EFFECT_END names ${id}, which is not an active effect (no EFFECT_START, or it already ended)`);
            } else if (gone.length > 0 && (held === null || gone.some((t) => !held.has(t)))) {
                error('effect-end-unknown', `record ${seqStr}: EFFECT_END removes a target ${id} does not have`);
            } else if (gone.length === 0 || held === null) {
                activeEffects.delete(id);
            } else {
                gone.forEach((t) => held.delete(t));
                if (held.size === 0) {
                    activeEffects.delete(id);
                }
            }
        }
        const walked = walkValues(r, `record ${seqStr}`);
        if (walked) {
            error(walked.code, walked.message);
        }
        const badToken = badTokenRef(r);
        if (badToken !== undefined) {
            error('bad-token-name', `record ${seqStr}: "${badToken}" breaks the token id grammar`);
        }
        if (r['t'] === 'STATUS_TOKEN' && typeof r['token'] === 'string' && !TOKEN_NAME.test(r['token'])) {
            error('bad-token-name', `record ${seqStr}: STATUS_TOKEN token "${r['token']}" breaks the token-name grammar`);
        }
        if (typeof r['for'] === 'string' && !seqs.has(r['for'])) {
            error('dangling-ref', `record ${seqStr}: for "${r['for']}" names no record`);
        }
        if (typeof r['zone'] === 'string' && !ZONES.includes(r['zone'])) {
            error('bad-zone', `record ${seqStr}: zone "${r['zone']}" is not a zone`);
        }
        // A Fortify upgrade attaches to the base of the seat that played it (§10.3, [V-06]).
        const fortifyHost = r['t'] === 'MOVE' && r['to'] === 'base' ? r['attachedTo']
            : r['t'] === 'PLAY_UPGRADE' ? r['target'] : undefined;
        if (typeof fortifyHost === 'string' && (/^base@[12]$/).test(fortifyHost) && typeof r['p'] === 'number' &&
          fortifyHost !== `base@${r['p']}`) {
            error('fortify-host', `record ${seqStr}: an upgrade played by seat ${r['p']} attaches to ${fortifyHost} (a Fortify upgrade attaches to its own seat's base)`);
        }
        if (r['t'] === 'ROUND_START' && r['active'] !== 1 && r['active'] !== 2) {
            error('round-start-active', `record ${seqStr}: ROUND_START without an active seat (the initiative holder, [W-46])`);
        }
        if (r['t'] === 'MOVE') {
            for (const k of ['from', 'to']) {
                if (typeof r[k] === 'string' && !ZONES.includes(r[k] as string)) {
                    error('bad-zone', `record ${seqStr}: ${k} "${r[k] as string}" is not a zone`);
                }
            }
            // Building the decks is stated by DECKS and INIT, never by moves (§10.1, [W-41]).
            if (r['from'] === 'outsideTheGame' && r['to'] === 'deck') {
                error('deck-build-move', `record ${seqStr}: MOVE from outsideTheGame into deck (the decks are built by DECKS and INIT)`);
            }
            // A Credit token is recorded in base, whatever zone the rules place it in (§6.2, [W-42]).
            // A malformed id is a bad-token-name only, so a Credit is one whose id is well-formed.
            const isCredit = typeof r['card'] === 'string' && TOKEN_ID.test(r['card']) && tokenNameOf(r['card']) === 'credit';
            if (isCredit && (r['from'] === 'resource' || r['to'] === 'resource')) {
                error('credit-zone', `record ${seqStr}: Credit token "${r['card']}" MOVE names resource (a Credit token is recorded in base)`);
            }
            // A token that leaves play ceases to exist, so the move names outsideTheGame (CR 3.7.3, [W-47]).
            // One moving with its unit to the other arena stays in play; a Credit or the Force token
            // never takes an arena slot (§6.5), so it has no such move.
            const changesArena = isArena(String(r['from'])) && isArena(String(r['to'])) && !isCredit &&
              !(typeof r['card'] === 'string' && TOKEN_ID.test(r['card']) && tokenNameOf(r['card']) === 'the-force');
            if (typeof r['card'] === 'string' && r['card'].startsWith('TOKEN:') && r['to'] !== 'outsideTheGame' &&
              r['from'] !== r['to'] && !changesArena && (r['from'] === 'base' || isArena(String(r['from'])))) {
                error('token-zone', `record ${seqStr}: token "${r['card']}" leaves ${String(r['from'])} for ${String(r['to'])} (a token leaving play goes to outsideTheGame)`);
            }
            // Only an arena may be both ends of a move: an attachment changing in place (§10.1).
            if (r['from'] === r['to'] && !isArena(String(r['from']))) {
                error('same-zone-move', `record ${seqStr}: MOVE from ${String(r['from'])} to itself`);
            }
        }
        const kf = asRecord(r['keyframe']);
        const players = kf ? asRecord(kf['players']) : null;
        for (const ps of Object.values(players ?? {})) {
            const seat = asRecord(ps) ?? {};
            const lists: unknown[] = ['cards', 'hand', 'discard', 'resources', 'baseUpgrades', 'baseCaptured', 'abilityUses', 'foreignResources'].map((k) => seat[k]);
            // The upgrades and captives a seat's cards hold between them, capped like one list (§12).
            let attachments = 0;
            for (const c of Array.isArray(seat['cards']) ? seat['cards'] : []) {
                const card = asRecord(c) ?? {};
                lists.push(card['upgrades'], card['captured'], card['traits'], card['aspects']);
                attachments += (Array.isArray(card['upgrades']) ? card['upgrades'].length : 0) + (Array.isArray(card['captured']) ? card['captured'].length : 0);
                if (typeof card['zone'] === 'string' && !ZONES.includes(card['zone'])) {
                    error('bad-zone', `record ${seqStr}: keyframe card zone "${card['zone']}" is not a zone`);
                }
            }
            // §23: no real board comes near it, and a reader that holds the list would
            // otherwise grow without bound on a hostile file (the fold refuses such a keyframe).
            if (lists.some((l) => Array.isArray(l) && l.length > MAX_ZONE_LIST)) {
                error('over-cap', `record ${seqStr}: a keyframe list is longer than ${MAX_ZONE_LIST}`);
            } else if (attachments > MAX_ZONE_LIST) {
                error('over-cap', `record ${seqStr}: a keyframe seat's cards hold more than ${MAX_ZONE_LIST} upgrades and captives`);
            }
        }
        const kfEffects = kf ? kf['effects'] : undefined;
        const overCap = (l: unknown) => Array.isArray(l) && l.length > MAX_ZONE_LIST;
        if (Array.isArray(kfEffects) && (overCap(kfEffects) || kfEffects.some((fx) => overCap(asRecord(fx)?.['targets'])))) {
            error('over-cap', `record ${seqStr}: a keyframe list is longer than ${MAX_ZONE_LIST}`);
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
            add({ severity: 'warning', code: 'unknown-section', line: i + 1, message: `line ${i + 1}: unknown section "%%% ${name}" — its records were skipped (tolerated for forward compatibility)` });
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
        // [V-05] also holds inside a what-if `line` (an array of events), but not in `text`, which
        // is prose and may mention a token however it likes.
        const what = Array.isArray(ann['line']) ? ann['line'] : [];
        for (const e of what) {
            const bad = badTokenRef(e);
            if (bad !== undefined) {
                error('bad-token-name', `annotation on ${String(ann['ref'])}: "${bad}" breaks the token id grammar`);
            }
            const ev = asRecord(e);
            if (ev && ev['t'] === 'STATUS_TOKEN' && typeof ev['token'] === 'string' && !TOKEN_NAME.test(ev['token'])) {
                error('bad-token-name', `annotation on ${String(ann['ref'])}: STATUS_TOKEN token "${ev['token']}" breaks the token-name grammar`);
            }
        }
        if (!seqs.has(ann['ref'] as string)) {
            error('dangling-ref', `annotation ref "${String(ann['ref'])}" names no record`);
        }
        // §15: a reply whose parent is gone is shown as a top-level note, not dropped.
        if (typeof ann['parent'] === 'string' && !noteIds.has(ann['parent'])) {
            warn('dangling-parent', `annotation parent "${ann['parent']}" names no annotation id; shown as a top-level note`);
        }
    }

    // §10.2: GAME_END.winner MUST agree with the header's Result, and a file with no GAME_END is
    // Incomplete. The last GAME_END counts: play may go on after the game ends. An outcome from
    // a newer minor version is skipped (§18).
    const resultOfWinner = new Map<unknown, string>([[1, 'P1'], [2, 'P2'], ['Draw', 'Draw']]);
    if (['P1', 'P2', 'Draw', 'Incomplete'].includes(doc.header.result)) {
        const gameEnd = doc.events.map(asRecord).filter((r) => r?.['t'] === 'GAME_END')
            .pop();
        const expected = gameEnd ? resultOfWinner.get(gameEnd['winner']) : 'Incomplete';
        if (expected !== undefined && expected !== doc.header.result) {
            error('result-mismatch', `[Result "${doc.header.result}"] but ${gameEnd ? `GAME_END ${String(gameEnd['seq'])} says ${expected}` : 'there is no GAME_END'}`);
        }
    }

    // complete: the writer lost nothing it knows of. These are reported whatever else is wrong
    // with the file (§24: a validator reports every issue it finds). A reason this version does
    // not know reads as `unknown` (§18).
    if ((doc.header.recorderErrors ?? 0) > 0) {
        warn('recorder-errors', `[RecorderErrors "${doc.header.recorderErrors}"]: the writer lost records`);
    }
    const unknownDefeats = [...doc.setup, ...doc.events].filter((e) => {
        const r = asRecord(e);
        return r?.['t'] === 'DEFEAT' && (typeof r['reason'] !== 'string' || r['reason'] === 'unknown' || !DEFEAT_REASONS.has(r['reason']));
    }).length;
    if (unknownDefeats > 0) {
        warn('unknown-defeat', `${unknownDefeats} DEFEAT record(s) whose reason reads as "unknown"`);
    }

    // verified: the stream accounts for every keyframe (§14). Not an error: §14 lets a writer
    // ship a file that fails the gate, because the keyframes stay authoritative. Folding a file
    // that breaks a schema or cross-record rule proves nothing, so the check needs a clean file.
    if (!hasErrors) {
        const integrity = checkKeyframes(doc.events);
        if (!integrity.ok) {
            warn('keyframe-mismatch', `${integrity.mismatches.length} keyframe mismatch(es), first at ${integrity.mismatches[0]?.seq ?? '?'}`);
        }
    }

    return { valid: !hasErrors, level: levelOf(hasErrors, seen), formatVersion, issues };
}

/** The highest level every reported issue allows (§2.1, §24 "Level at most"). */
function levelOf(hasErrors: boolean, codes: ReadonlySet<string>): ConformanceLevel {
    const order: ConformanceLevel[] = ['malformed', 'well-formed', 'valid', 'verified', 'complete'];
    let level = order.indexOf(hasErrors ? 'well-formed' : 'complete');
    for (const code of codes) {
        const cap = WARNING_CAP[code];
        if (cap !== undefined) {
            level = Math.min(level, order.indexOf(cap));
        }
    }
    return order[level];
}
