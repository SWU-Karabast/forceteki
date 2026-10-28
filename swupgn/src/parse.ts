import type { SwuPgnDocument, Header, DeckRecord, GameEvent, Annotation, SetupInitRecord, CardIndexRecord } from './types';

/**
 * A reader error with a stable `code` (spec §24 error table) so a consumer can branch on what went
 * wrong without matching message text, which is free to change.
 */
export class SwuPgnError extends Error {
    public readonly code: string;
    public readonly line?: number;

    public constructor(code: string, message: string, line?: number) {
        super(`SWU-PGN: ${message}`);
        this.name = 'SwuPgnError';
        this.code = code;
        this.line = line;
    }
}

/**
 * Resource limits (spec §23). A reader MAY cap these and MUST reject a file that exceeds one
 * rather than read part of it. The defaults sit far above any real game (the largest vector is
 * 66 KB, its longest line under 4 KB, under 1000 records) and far below what hurts a browser.
 */
export interface ParseLimits {
    maxBytes?: number;
    maxLineLength?: number;
    maxRecords?: number;
    maxDepth?: number;
}

export const DEFAULT_LIMITS: Required<ParseLimits> = {
    maxBytes: 16 * 1024 * 1024,
    maxLineLength: 1024 * 1024,
    maxRecords: 1_000_000,
    maxDepth: 64,
};

/** One `[Tag "value"]` pair. The only escapes are `\\` and `\"` (spec §4). */
const TAG_PAIR = /\[([A-Za-z0-9]+)\s+"((?:[^"\\]|\\.)*)"\]/g;
const HEADER_LINE = /^(?:\s*\[[A-Za-z0-9]+\s+"(?:[^"\\]|\\.)*"\])+\s*$/;

function parseHeaderLine(line: string, lineNo: number, raw: Record<string, string>): void {
    // A line may hold several pairs, but nothing else: text outside the brackets is a broken file,
    // not something to skip, because a skipped fragment can be half of a tag.
    if (!HEADER_LINE.test(line)) {
        throw new SwuPgnError('bad-header-line', `header line ${lineNo} is not a list of [Tag "value"] pairs`, lineNo);
    }
    let m: RegExpExecArray | null;
    TAG_PAIR.lastIndex = 0;
    while ((m = TAG_PAIR.exec(line)) !== null) {
        if (!(/^(?:[^\\]|\\["\\])*$/).test(m[2])) {
            throw new SwuPgnError('bad-escape', `header tag [${m[1]}] on line ${lineNo} uses an escape other than \\\\ or \\"`, lineNo);
        }
        if (Object.prototype.hasOwnProperty.call(raw, m[1])) {
            throw new SwuPgnError('duplicate-tag', `header tag [${m[1]}] appears twice (line ${lineNo})`, lineNo);
        }
        Object.defineProperty(raw, m[1], { value: m[2].replace(/\\(.)/g, '$1'), enumerable: true, writable: true, configurable: true });
    }
}

/**
 * One pass over a JSON line before `JSON.parse` sees it. It measures the nesting depth, so a line
 * of ten thousand `[` is refused cheaply instead of being handed to every recursive consumer
 * downstream, and it finds the first key an object repeats. I-JSON forbids that (spec §4), and
 * `JSON.parse` would silently keep the last one where another language's parser keeps the first,
 * so two readers would fold the same line differently.
 */
function scanJson(line: string): { depth: number; duplicateKey?: string } {
    // One frame per open object or array; an object frame holds its keys so far.
    const frames: { keys: Set<string> | null; expectKey: boolean }[] = [];
    let max = 0;
    let duplicateKey: string | undefined;
    let stringStart = -1;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (stringStart >= 0) {
            if (ch === '\\') {
                i++;
            } else if (ch === '"') {
                const top = frames[frames.length - 1];
                if (top?.keys && top.expectKey) {
                    top.expectKey = false;
                    const literal = line.slice(stringStart, i + 1);
                    let key: string | undefined;
                    try {
                        // Compare keys as JSON reads them, so `"a"` and `"a"` are one key.
                        key = literal.includes('\\') ? JSON.parse(literal) as string : literal.slice(1, -1);
                    } catch {
                        key = undefined;   // not JSON; JSON.parse rejects the whole line next
                    }
                    if (key !== undefined && duplicateKey === undefined && top.keys.has(key)) {
                        duplicateKey = key;
                    }
                    if (key !== undefined) {
                        top.keys.add(key);
                    }
                }
                stringStart = -1;
            }
        } else if (ch === '"') {
            stringStart = i;
        } else if (ch === '{' || ch === '[') {
            frames.push({ keys: ch === '{' ? new Set<string>() : null, expectKey: ch === '{' });
            if (frames.length > max) {
                max = frames.length;
            }
        } else if (ch === '}' || ch === ']') {
            frames.pop();
        } else if (ch === ',') {
            const top = frames[frames.length - 1];
            if (top?.keys) {
                top.expectKey = true;
            }
        }
    }
    return { depth: max, ...(duplicateKey !== undefined ? { duplicateKey } : {}) };
}

/** A header count: base-10 digits only, within the safe-integer range. */
function strictCount(value: string): number | undefined {
    return (/^\d+$/).test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined;
}

/**
 * The first line of every file (spec §4, Appendix B `game-line`): the `Game` tag alone, with a
 * numeric major and minor version.
 */
const GAME_LINE = /^\[Game[ \t]+"SWU-PGN\/(\d+)\.(\d+)"\]$/;

/** The major version this reader reads. A file of any other major is refused (spec §18). */
export const READER_MAJOR = 1;

function buildHeader(raw: Record<string, string>): Header {
    const req = (k: string): string => {
        if (!Object.prototype.hasOwnProperty.call(raw, k)) {
            throw new SwuPgnError('missing-tag', `missing required header tag [${k}]`);
        }
        return raw[k];
    };
    const requiredCount = (value: string, k: string): number => {
        const n = strictCount(value);
        if (n === undefined) {
            throw new SwuPgnError('bad-count', `header tag [${k}] must be base-10 digits, got "${value}"`);
        }
        return n;
    };
    // An optional count that is present must be a count too. Dropping a corrupt one would read
    // `[RecorderErrors "x"]` as "no errors recorded", and absent and zero mean different things.
    const optionalCount = (k: string): number | undefined =>
        (Object.prototype.hasOwnProperty.call(raw, k) ? requiredCount(raw[k], k) : undefined);
    const recorderErrors = optionalCount('RecorderErrors');
    const undos = optionalCount('Undos');
    const writerRevision = optionalCount('WriterRevision');
    const gameNumber = optionalCount('GameNumber');
    return {
        game: req('Game'), gameId: req('GameId'), date: req('Date'),
        format: raw['Format'], cardPool: req('CardPool'), engine: req('Engine'),
        seed: req('Seed'),
        // The 'as' casts below are intentional: structural parsing trusts the raw
        // string values here; enum/value validation is performed by validate(),
        // not the parser.
        perspective: (raw['Perspective'] as Header['perspective']) ?? null,
        p1Id: req('P1Id'), p2Id: req('P2Id'), p1: req('P1'), p2: req('P2'),
        p1Leader: req('P1Leader'), p1Base: req('P1Base'),
        p2Leader: req('P2Leader'), p2Base: req('P2Base'),
        result: req('Result') as Header['result'], reason: req('Reason'),
        rounds: requiredCount(req('Rounds'), 'Rounds'),
        ...(recorderErrors !== undefined ? { recorderErrors } : {}),
        ...(undos !== undefined ? { undos } : {}),
        ...(writerRevision !== undefined ? { writerRevision } : {}),
        ...(raw['EndDate'] != null ? { endDate: raw['EndDate'] } : {}),
        ...(raw['Match'] != null ? { match: raw['Match'] } : {}),
        ...(gameNumber !== undefined ? { gameNumber } : {}),
    };
}

type Section = 'NONE' | 'UNKNOWN' | 'STORY' | 'DECKS' | 'CARDS' | 'SETUP' | 'EVENTS' | 'ANNOTATIONS';

/** Sections whose lines are NDJSON records. `STORY` is deliberately not one of them. */
export const JSON_SECTIONS = ['DECKS', 'CARDS', 'SETUP', 'EVENTS', 'ANNOTATIONS'];

/**
 * Every `%%%` banner this version knows. Exported so `validate()` warns on exactly the set
 * `parse()` accepts -- two hand-maintained copies drift, and the warning then fires on a
 * section the reader does happily parse, or stays silent on one it drops.
 */
export const KNOWN_SECTIONS: readonly string[] = ['STORY', ...JSON_SECTIONS];

/** Drop leading/trailing blank lines a section banner's spacing leaves around the prose. */
function trimBlankEdges(lines: string[]): string[] {
    let start = 0;
    let end = lines.length;
    while (start < end && lines[start].trim() === '') {
        start++;
    }
    while (end > start && lines[end - 1].trim() === '') {
        end--;
    }
    return lines.slice(start, end);
}

export function parse(text: string, limits: ParseLimits = {}): SwuPgnDocument {
    const lim = { ...DEFAULT_LIMITS, ...limits };
    if (text.length > lim.maxBytes) {
        throw new SwuPgnError('too-large', `file is ${text.length} characters, over the ${lim.maxBytes} limit`);
    }
    // Writers MUST NOT emit a byte order mark; readers strip one, because editors add it.
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    const raw: Record<string, string> = {};
    const story: string[] = [];
    const decks: DeckRecord[] = [];
    const cards: CardIndexRecord[] = [];
    const setup: (SetupInitRecord | GameEvent)[] = [];
    const events: GameEvent[] = [];
    const annotations: Annotation[] = [];
    const seen = new Set<string>();
    let section: Section = 'NONE';
    let records = 0;
    let sawFirst = false;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        if (rawLine.length > lim.maxLineLength) {
            throw new SwuPgnError('line-too-long', `line ${i + 1} is ${rawLine.length} characters, over the ${lim.maxLineLength} limit`, i + 1);
        }
        const line = rawLine.trim();

        // The first line is the magic number (spec §19): `[Game "SWU-PGN/…"]`. Anything else is
        // not this format, and saying so beats a confusing "missing tag" three screens later.
        if (!sawFirst) {
            if (line.length === 0) {
                continue;
            }
            sawFirst = true;
            const game = GAME_LINE.exec(line);
            if (!game) {
                throw new SwuPgnError('not-swupgn', 'the first line is not a [Game "SWU-PGN/<major>.<minor>"] tag alone on its line', i + 1);
            }
            if (Number(game[1]) !== READER_MAJOR) {
                throw new SwuPgnError('unsupported-major', `SWU-PGN/${game[1]}.${game[2]} is major version ${game[1]}; this reader reads major version ${READER_MAJOR}`, i + 1);
            }
        }

        // %%% STORY is prose, not NDJSON: keep every line verbatim (blank lines included,
        // they are part of the layout) until the next banner.
        if (section === 'STORY' && !line.startsWith('%%%')) {
            story.push(rawLine.replace(/\r$/, ''));
            continue;
        }
        if (line.length === 0) {
            continue;
        }
        // Header lines only exist before the first banner (spec §4). Inside a JSON section a
        // `[`-prefixed line is a record (a JSON array), and must reach the JSON path below so
        // that validate() can reject it, rather than vanish as a mis-parsed header.
        if (section === 'NONE' && line.startsWith('[')) {
            parseHeaderLine(line, i + 1, raw);
            continue;
        }
        if (line.startsWith('%%%')) {
            const name = line.slice(3).trim()
                .toUpperCase();
            // A section appears once. Two `%%% EVENTS` banners would be two streams in one
            // file, and nothing says which order to fold them in.
            if (seen.has(name)) {
                throw new SwuPgnError('duplicate-section', `section %%% ${name} appears twice (line ${i + 1})`, i + 1);
            }
            seen.add(name);
            section = (name === 'STORY' || JSON_SECTIONS.includes(name) ? name : 'UNKNOWN') as Section;
            continue;
        }
        if (section === 'NONE') {
            throw new SwuPgnError('record-outside-section', `record before any %%% section on line ${i + 1}`, i + 1);
        }
        // A section this reader does not know is a LATER version's, not a broken file (§18):
        // skip its lines unread. A later version may make it prose, like STORY, so its lines are
        // not even required to be JSON.
        if (section === 'UNKNOWN') {
            continue;
        }
        if (++records > lim.maxRecords) {
            throw new SwuPgnError('too-many-records', `more than ${lim.maxRecords} records`, i + 1);
        }
        const scanned = scanJson(line);
        if (scanned.depth > lim.maxDepth) {
            throw new SwuPgnError('too-deep', `line ${i + 1} nests JSON deeper than ${lim.maxDepth}`, i + 1);
        }
        let rec: unknown;
        try {
            rec = JSON.parse(line);
        } catch {
            throw new SwuPgnError('bad-json', `invalid JSON on line ${i + 1}`, i + 1);
        }
        if (scanned.duplicateKey !== undefined) {
            throw new SwuPgnError('duplicate-key', `line ${i + 1} repeats the key "${scanned.duplicateKey}" in one object`, i + 1);
        }
        switch (section) {
            case 'DECKS': decks.push(rec as DeckRecord); break;
            case 'CARDS': cards.push(rec as CardIndexRecord); break;
            case 'SETUP': setup.push(rec as SetupInitRecord | GameEvent); break;
            case 'EVENTS': events.push(rec as GameEvent); break;
            case 'ANNOTATIONS': annotations.push(rec as Annotation); break;
            default: break;
        }
    }
    if (!sawFirst) {
        throw new SwuPgnError('not-swupgn', 'the file is empty');
    }

    return { header: buildHeader(raw), story: trimBlankEdges(story), decks, cards, setup, events, annotations };
}
