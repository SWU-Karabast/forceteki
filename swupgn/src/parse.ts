import { SwuPgnError } from './errors.js';
import type { Annotation, CardLine, DeckLine, SwuPgnFile, SwuRecord } from './generated/types.js';

/**
 * Resource limits (SPEC [P-23]). A parser MAY cap these and MUST reject a file over a cap rather
 * than read part of it. The defaults sit far above any real game and far below what hurts a browser.
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

/** The major version this parser reads ([P-20]). */
const READER_MAJOR = '0';

/**
 * Object keys that name the object model rather than data ([P-24]): every property of
 * `Object.prototype`, and `prototype`.
 */
const RESERVED_KEYS: ReadonlySet<string> = new Set([
    '__proto__', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__',
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'prototype',
    'toLocaleString', 'toString', 'valueOf',
]);

/** The tags of SPEC 5.1 that every file carries ([P-14]). */
const REQUIRED_TAGS: readonly string[] = [
    'Game', 'Visibility', 'Steps', 'GameId', 'Date', 'CardPool', 'Engine', 'P1Id', 'P2Id', 'P1', 'P2',
    'P1Leader', 'P2Leader', 'P1Base', 'P2Base', 'Result', 'Reason', 'Rounds',
];

/** The tags that must be counts when present ([P-16]). `Rounds` is required, the rest optional. */
const COUNT_TAGS: readonly string[] = ['Rounds', 'Undos', 'GameNumber', 'WriterRevision', 'WriterErrors'];

const TAG_PAIR = /\[([A-Za-z0-9]+)[ \t]+"((?:[^"\\]|\\.)*)"\]/g;
const HEADER_LINE = /^(?:[ \t]*\[[A-Za-z0-9]+[ \t]+"(?:[^"\\]|\\.)*"\])+[ \t]*$/;
const GAME_LINE = /^\[Game[ \t]+"SWU-PGN\/(\d+)\.(\d+)"\]$/;

type Section = 'NONE' | 'STORY' | 'DECKS' | 'CARDS' | 'RECORDS' | 'ANNOTATIONS' | 'UNKNOWN';

interface ScanResult {
    tooDeep: boolean;
    duplicateKey?: string;
    reservedKey?: string;
}

/** The 1-based line each parsed record came from, for `apply`'s error reports. Not part of the parsed value. */
const RECORD_LINES = new WeakMap<object, number>();

/** @internal The 1-based file line a parsed record came from, if it was parsed. Not re-exported from the entry. */
export function lineOf(record: object): number | undefined {
    return RECORD_LINES.get(record);
}

/**
 * One pass over a JSON line before `JSON.parse` sees it. It stops at `maxDepth`, finds the first
 * key an object repeats ([P-10]), and finds the first reserved key ([P-24]).
 */
function scanJson(line: string, maxDepth: number): ScanResult {
    const frames: { isObject: boolean; keys: Set<string> | null; expectKey: boolean }[] = [];
    let duplicateKey: string | undefined;
    let reservedKey: string | undefined;
    let stringStart = -1;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (stringStart >= 0) {
            if (ch === '\\') {
                i++;
            } else if (ch === '"') {
                const top = frames[frames.length - 1];
                if (top?.isObject && top.expectKey) {
                    top.expectKey = false;
                    const literal = line.slice(stringStart, i + 1);
                    let key: string | undefined;
                    try {
                        key = literal.includes('\\') ? JSON.parse(literal) as string : literal.slice(1, -1);
                    } catch {
                        key = undefined;   // not JSON; JSON.parse rejects the whole line next
                    }
                    if (key !== undefined) {
                        top.keys ??= new Set<string>();
                        if (duplicateKey === undefined && top.keys.has(key)) {
                            duplicateKey = key;
                        }
                        if (reservedKey === undefined && RESERVED_KEYS.has(key)) {
                            reservedKey = key;
                        }
                        top.keys.add(key);
                    }
                }
                stringStart = -1;
            }
        } else if (ch === '"') {
            stringStart = i;
        } else if (ch === '{' || ch === '[') {
            if (frames.length >= maxDepth) {
                return { tooDeep: true };
            }
            frames.push({ isObject: ch === '{', keys: null, expectKey: ch === '{' });
        } else if (ch === '}' || ch === ']') {
            frames.pop();
        } else if (ch === ',') {
            const top = frames[frames.length - 1];
            if (top?.isObject) {
                top.expectKey = true;
            }
        }
    }
    return {
        tooDeep: false,
        ...(duplicateKey !== undefined ? { duplicateKey } : {}),
        ...(reservedKey !== undefined ? { reservedKey } : {}),
    };
}

/** The UTF-8 encoded length of `text`, counted without encoding it. */
function utf8Length(text: string): number {
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
        const unit = text.charCodeAt(i);
        if (unit < 0x80) {
            bytes += 1;
        } else if (unit < 0x800) {
            bytes += 2;
        } else if (unit >= 0xD800 && unit <= 0xDBFF && (text.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            bytes += 4;
            i++;
        } else {
            bytes += 3;
        }
    }
    return bytes;
}

/** Drop leading and trailing blank lines ([P-11]). */
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

function has(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Parse the header tags of one line into `raw`, remembering the line of each tag in `lineOf`. */
function parseHeaderLine(line: string, lineNo: number, raw: Record<string, string>, lineOf: Map<string, number>): void {
    if (!HEADER_LINE.test(line)) {
        throw new SwuPgnError('bad-header-line', `header line ${lineNo} is not a list of [Tag "value"] pairs`, lineNo);
    }
    let m: RegExpExecArray | null;
    TAG_PAIR.lastIndex = 0;
    while ((m = TAG_PAIR.exec(line)) !== null) {
        if (!(/^(?:[^\\]|\\["\\])*$/).test(m[2])) {
            throw new SwuPgnError('bad-escape', `header tag [${m[1]}] on line ${lineNo} uses an escape other than \\\\ or \\"`, lineNo);
        }
        if (RESERVED_KEYS.has(m[1])) {
            throw new SwuPgnError('reserved-key', `header tag [${m[1]}] on line ${lineNo} is a reserved key`, lineNo);
        }
        if (has(raw, m[1])) {
            throw new SwuPgnError('duplicate-tag', `header tag [${m[1]}] appears twice (line ${lineNo})`, lineNo);
        }
        Object.defineProperty(raw, m[1], { value: m[2].replace(/\\(.)/g, '$1'), enumerable: true, writable: true, configurable: true });
        lineOf.set(m[1], lineNo);
    }
}

/** Check the header once it is complete: required tags ([P-14]) and counts ([P-16]). */
function checkHeader(raw: Record<string, string>, lineOf: Map<string, number>, endLine: number): void {
    for (const tag of COUNT_TAGS) {
        if (has(raw, tag) && !((/^\d+$/).test(raw[tag]) && Number.isSafeInteger(Number(raw[tag])))) {
            throw new SwuPgnError('bad-count', `header tag [${tag}] must be base-10 digits within the integer range, got "${raw[tag]}"`, lineOf.get(tag));
        }
    }
    for (const tag of REQUIRED_TAGS) {
        if (!has(raw, tag)) {
            throw new SwuPgnError('missing-tag', `missing required header tag [${tag}]`, endLine);
        }
    }
}

/**
 * Parse a `.swupgn` text into a `SwuPgnFile`. Throws `SwuPgnError` with a fatal code and a 1-based
 * line ([P-12]); nothing partial is returned. Structure only: the validator checks values.
 */
export function parse(text: string, limits: ParseLimits = {}): SwuPgnFile {
    const lim = { ...DEFAULT_LIMITS, ...limits };
    const size = text.length > lim.maxBytes ? text.length : utf8Length(text);
    if (size > lim.maxBytes) {
        throw new SwuPgnError('too-large', `file is over the ${lim.maxBytes}-byte limit`);
    }
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    const raw: Record<string, string> = {};
    const lineOf = new Map<string, number>();
    const story: string[] = [];
    const decks: DeckLine[] = [];
    const cards: CardLine[] = [];
    const records: SwuRecord[] = [];
    const annotations: Annotation[] = [];
    const unknownSections: SwuPgnFile['unknownSections'] = [];
    const seen = new Set<string>();
    let section: Section = 'NONE';
    let headerChecked = false;
    let count = 0;
    let sawFirst = false;

    const lines = text.split('\n');
    // A final line end leaves an empty last element that is not a line.
    const lineCount = lines.length > 1 && lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;
    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        if (rawLine.length > lim.maxLineLength) {
            throw new SwuPgnError('line-too-long', `line ${i + 1} is ${rawLine.length} characters, over the ${lim.maxLineLength} limit`, i + 1);
        }
        const bare = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
        const line = bare.trim();

        if (!sawFirst) {
            if (line.length === 0) {
                continue;
            }
            sawFirst = true;
            const game = GAME_LINE.exec(line);
            if (!game) {
                throw new SwuPgnError('not-swupgn', 'the first line is not a [Game "SWU-PGN/<major>.<minor>"] tag alone on its line', i + 1);
            }
            if (game[1] !== READER_MAJOR) {
                throw new SwuPgnError('unsupported-major', `SWU-PGN/${game[1]}.${game[2]} is major version ${game[1]}; this parser reads major version ${READER_MAJOR}`, i + 1);
            }
        }

        // STORY is prose: keep every line verbatim until the next banner ([P-11]).
        if (section === 'STORY' && !line.startsWith('%%%')) {
            story.push(bare);
            continue;
        }
        if (line.length === 0) {
            continue;
        }
        if (section === 'NONE' && line.startsWith('[')) {
            parseHeaderLine(line, i + 1, raw, lineOf);
            continue;
        }
        if (line.startsWith('%%%')) {
            if (!headerChecked) {
                headerChecked = true;
                checkHeader(raw, lineOf, i + 1);
            }
            const name = line.slice(3).trim()
                .toUpperCase();
            if (seen.has(name)) {
                throw new SwuPgnError('duplicate-section', `section %%% ${name} appears twice (line ${i + 1})`, i + 1);
            }
            seen.add(name);
            switch (name) {
                case 'STORY': case 'DECKS': case 'CARDS': case 'RECORDS': case 'ANNOTATIONS':
                    section = name;
                    break;
                default:
                    section = 'UNKNOWN';
                    unknownSections.push({ name, lines: [] });
            }
            continue;
        }
        if (section === 'NONE') {
            throw new SwuPgnError('record-outside-section', `record before any %%% section on line ${i + 1}`, i + 1);
        }
        // A section this version does not define is skipped unread ([P-09]).
        if (section === 'UNKNOWN') {
            unknownSections[unknownSections.length - 1].lines.push(bare);
            continue;
        }
        if (++count > lim.maxRecords) {
            throw new SwuPgnError('too-many-records', `more than ${lim.maxRecords} records`, i + 1);
        }
        const scanned = scanJson(line, lim.maxDepth);
        if (scanned.tooDeep) {
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
        if (scanned.reservedKey !== undefined) {
            throw new SwuPgnError('reserved-key', `line ${i + 1} uses the reserved key "${scanned.reservedKey}"`, i + 1);
        }
        switch (section) {
            case 'DECKS': decks.push(rec as DeckLine); break;
            case 'CARDS': cards.push(rec as CardLine); break;
            case 'RECORDS':
                records.push(rec as SwuRecord);
                if (typeof rec === 'object' && rec !== null) {
                    RECORD_LINES.set(rec, i + 1);
                }
                break;
            default: annotations.push(rec as Annotation); break;
        }
    }
    if (!sawFirst) {
        throw new SwuPgnError('not-swupgn', 'the file is empty');
    }
    if (!headerChecked) {
        checkHeader(raw, lineOf, lineCount);
    }

    const storyLines = trimBlankEdges(story);
    return {
        header: raw,
        ...(storyLines.length > 0 ? { story: storyLines.join('\n') } : {}),
        decks, cards, records, annotations,
        unknownSections,
    };
}
