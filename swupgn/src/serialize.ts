import { SwuPgnError } from './errors.js';
import type { SwuPgnFile } from './generated/types.js';
import { ATTRIBUTES } from './registry.js';

/** The version a file with no `Game` tag is written as. */
const DEFAULT_GAME = 'SWU-PGN/0.1';

/** Header tags after `Game`, `Visibility` and `Steps`, in the order of SPEC 5.4. */
const TAG_ORDER: readonly string[] = [
    'GameId', 'Date', 'EndDate', 'CardPool', 'Engine', 'P1Id', 'P2Id', 'P1', 'P2', 'Result', 'Reason',
    'Rounds', 'Format', 'Match', 'GameNumber', 'Undos', 'P1Leader', 'P2Leader', 'P1Base', 'P2Base',
    'Seed', 'WriterRevision', 'WriterErrors',
];

const LEADING_TAGS: readonly string[] = ['Game', 'Visibility', 'Steps'];

/** Key order of each record type ([W-07]); `t` always comes first. */
const RECORD_KEYS: Readonly<Record<string, readonly string[]>> = {
    create: ['e', 'zone', 'owner', 'controller', 'parent', 'rel', 'card', 'to', 'a'],
    set: ['e', 'zone', 'owner', 'controller', 'parent', 'rel', 'a'],
    remove: ['e'],
    reveal: ['e', 'card', 'to'],
    step: ['seq', 'ms'],
    block: ['id', 'kind', 'p', 'src', 'targets', 'options', 'amount', 'parent', 'via', 'group', 'text'],
};
const DECK_KEYS: readonly string[] = ['p', 'leaders', 'base', 'complete', 'main', 'sideboard', 'order'];
const CARD_KEYS: readonly string[] = ['id', 'name', 'backSideName'];
const ANNOTATION_KEYS: readonly string[] = ['seq', 'text', 'nag', 'by', 'id', 'parent'];

const ATTRIBUTE_RANK: ReadonlyMap<string, number> = new Map(ATTRIBUTES.map((a, i) => [a.name, i]));

/** Compare by code point, not by UTF-16 unit. */
function compareCodePoints(a: string, b: string): number {
    const ia = a[Symbol.iterator]();
    const ib = b[Symbol.iterator]();
    for (;;) {
        const x = ia.next();
        const y = ib.next();
        if (x.done || y.done) {
            return (x.done ? 0 : 1) - (y.done ? 0 : 1);
        }
        const cx = x.value.codePointAt(0) as number;
        const cy = y.value.codePointAt(0) as number;
        if (cx !== cy) {
            return cx - cy;
        }
    }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Write a JSON value as-is, with no whitespace. `JSON.stringify` already writes the canonical string and number forms. */
function writeValue(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(writeValue).join(',')}]`;
    }
    if (isPlainObject(value)) {
        return `{${Object.keys(value).map((k) => `${JSON.stringify(k)}:${writeValue(value[k])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value) ?? 'null';
}

/** Write an object with `order` keys first, then any other key in ascending code point order. */
function writeKeyed(obj: Record<string, unknown>, order: readonly string[], valueWriter: (key: string, value: unknown) => string = (_k, v) => writeValue(v)): string {
    const known = order.filter((k) => Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined);
    const rest = Object.keys(obj).filter((k) => !order.includes(k) && obj[k] !== undefined)
        .sort(compareCodePoints);
    return `{${[...known, ...rest].map((k) => `${JSON.stringify(k)}:${valueWriter(k, obj[k])}`).join(',')}}`;
}

/** An `a` object: registry order, then unregistered names ascending. */
function writeAttrs(attrs: unknown): string {
    if (!isPlainObject(attrs)) {
        return writeValue(attrs);
    }
    const names = Object.keys(attrs).filter((k) => attrs[k] !== undefined);
    const registered = names.filter((k) => ATTRIBUTE_RANK.has(k))
        .sort((x, y) => (ATTRIBUTE_RANK.get(x) as number) - (ATTRIBUTE_RANK.get(y) as number));
    const others = names.filter((k) => !ATTRIBUTE_RANK.has(k)).sort(compareCodePoints);
    return `{${[...registered, ...others].map((k) => `${JSON.stringify(k)}:${writeValue(attrs[k])}`).join(',')}}`;
}

function writeRecord(rec: unknown): string {
    if (!isPlainObject(rec)) {
        return writeValue(rec);
    }
    const order = typeof rec.t === 'string' && Object.prototype.hasOwnProperty.call(RECORD_KEYS, rec.t) ? RECORD_KEYS[rec.t] : [];
    const attrsEmpty = (k: string, v: unknown): boolean => k === 'a' && isPlainObject(v) && Object.keys(v).length === 0;
    const dropped = isPlainObject(rec.a) && attrsEmpty('a', rec.a) ? { ...rec, a: undefined } : rec;
    return writeKeyed(dropped, ['t', ...order], (k, v) => (k === 'a' ? writeAttrs(v) : writeValue(v)));
}

function escapeTag(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function headerLines(header: Record<string, string>): string[] {
    const out: string[] = [];
    const written = new Set<string>();
    const emit = (tag: string): void => {
        if (!Object.prototype.hasOwnProperty.call(header, tag) || written.has(tag)) {
            return;
        }
        const value = header[tag];
        if (!(/^[A-Za-z0-9]+$/).test(tag) || (/[\n\r]/).test(value)) {
            throw new SwuPgnError('bad-header-line', `header tag [${tag}] cannot be written: a tag name is ASCII letters and digits and a value holds no line break`);
        }
        written.add(tag);
        out.push(`[${tag} "${escapeTag(value)}"]`);
    };
    if (!Object.prototype.hasOwnProperty.call(header, 'Game')) {
        out.push(`[Game "${DEFAULT_GAME}"]`);
        written.add('Game');
    }
    [...LEADING_TAGS, ...TAG_ORDER].forEach(emit);
    Object.keys(header).filter((t) => !written.has(t))
        .sort(compareCodePoints)
        .forEach(emit);
    return out;
}

/**
 * Write a file in canonical form (SPEC [W-07]). `parse(serialize(f))` deep-equals `f`, except
 * for an empty unknown section, which is not written.
 */
export function serialize(file: SwuPgnFile): string {
    const out: string[] = headerLines(file.header);
    const section = (name: string, lines: string[]): void => {
        out.push('', `%%% ${name}`, ...lines);
    };
    if (file.story !== undefined) {
        const lines = file.story.split('\n');
        let start = 0;
        let end = lines.length;
        while (start < end && lines[start].trim() === '') {
            start++;
        }
        while (end > start && lines[end - 1].trim() === '') {
            end--;
        }
        if (end > start) {
            section('STORY', lines.slice(start, end));
        }
    }
    section('DECKS', file.decks.map((d) => (isPlainObject(d) ? writeKeyed(d, DECK_KEYS) : writeValue(d))));
    if (file.cards.length > 0) {
        section('CARDS', file.cards.map((c) => (isPlainObject(c) ? writeKeyed(c, CARD_KEYS) : writeValue(c))));
    }
    section('RECORDS', file.records.map(writeRecord));
    if (file.annotations.length > 0) {
        section('ANNOTATIONS', file.annotations.map((a) => (isPlainObject(a) ? writeKeyed(a, ANNOTATION_KEYS) : writeValue(a))));
    }
    for (const unknown of file.unknownSections) {
        if (unknown.lines.length > 0) {
            section(unknown.name.toUpperCase(), unknown.lines);
        }
    }
    return `${out.join('\n')}\n`;
}
