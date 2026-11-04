import * as fs from 'fs';
import * as path from 'path';
import { parse } from '../src/parse';
import type { ParseLimits } from '../src/parse';
import { SwuPgnError } from '../src/errors';
import type { SwuRecord } from '../src/generated/types';

const vectorsDir = path.resolve(__dirname, '..', '..', 'vectors');
const manifest: { vectors: { name: string; profiles: string[] }[]; negative: { file: string; code: string; line: number }[] } =
    JSON.parse(fs.readFileSync(path.join(vectorsDir, 'manifest.json'), 'utf8'));

/** The fatal codes the parser, not the validator, assigns ([P-*] rules and the reader limits). */
const PARSER_CODES = [
    'not-swupgn', 'unsupported-major', 'bad-header-line', 'bad-escape', 'duplicate-tag', 'missing-tag', 'bad-count',
    'duplicate-section', 'record-outside-section', 'bad-json', 'duplicate-key', 'reserved-key',
];

function readVector(file: string): string {
    return fs.readFileSync(path.join(vectorsDir, file), 'utf8');
}

function thrown(text: string, limits?: ParseLimits): SwuPgnError {
    try {
        parse(text, limits);
    } catch (e) {
        expect(e instanceof SwuPgnError).toBe(true);
        return e as SwuPgnError;
    }
    throw new Error('parse did not throw');
}

const MIN_HEADER = [
    '[Game "SWU-PGN/0.1"]', '[Visibility "full"]', '[Steps "decision"]', '[GameId "g"]', '[Date "2026-11-03T12:00:00Z"]',
    '[CardPool "SOR"]', '[Engine "x@1"]', '[P1Id "a"]', '[P2Id "b"]', '[P1 "A"]', '[P2 "B"]', '[Result "Draw"]',
    '[Reason "r"]', '[Rounds "1"]', '[P1Leader "SOR#005"]', '[P2Leader "SOR#010"]', '[P1Base "SOR#026"]', '[P2Base "SOR#029"]',
];

function small(sections: string[], header: string[] = MIN_HEADER, eol = '\n'): string {
    return [...header, '', '%%% DECKS', '', '%%% RECORDS', ...sections].join(eol) + eol;
}

describe('parse', () => {
    describe('fatal codes', () => {
        for (const entry of manifest.negative.filter((n) => PARSER_CODES.includes(n.code))) {
            it(`rejects ${entry.code} at line ${entry.line}`, () => {
                const err = thrown(readVector(entry.file));
                expect(err.code).toBe(entry.code);
                expect(err.line).toBe(entry.line);
            });
        }

        it('covers every parser code with a vector', () => {
            const have = manifest.negative.map((n) => n.code);
            expect(PARSER_CODES.filter((c) => !have.includes(c))).toEqual([]);
        });

        it('rejects an empty input as not-swupgn', () => {
            expect(thrown('').code).toBe('not-swupgn');
        });

        it('rejects a file over maxBytes (too-large)', () => {
            expect(thrown(small([]), { maxBytes: 100 }).code).toBe('too-large');
        });

        it('counts bytes, not characters, against maxBytes', () => {
            const text = small([]);
            const bytes = Buffer.byteLength(text, 'utf8');
            expect(() => parse(text, { maxBytes: bytes })).not.toThrow();
            expect(thrown(text, { maxBytes: bytes - 1 }).code).toBe('too-large');
        });

        it('rejects a long line (line-too-long) with its line number', () => {
            const err = thrown(small(['{"t":"step","seq":0}']), { maxLineLength: 25 });
            expect(err.code).toBe('line-too-long');
            expect(err.line).toBe(1 + MIN_HEADER.findIndex((l) => l.length > 25));
        });

        it('rejects too many records (too-many-records)', () => {
            const text = small(['{"t":"step","seq":0}', '{"t":"step","seq":1}', '{"t":"step","seq":2}']);
            expect(() => parse(text, { maxRecords: 3 })).not.toThrow();
            const err = thrown(text, { maxRecords: 2 });
            expect(err.code).toBe('too-many-records');
            expect(err.line).toBe(MIN_HEADER.length + 7);
        });

        it('rejects deep nesting (too-deep)', () => {
            const text = small(['{"t":"x","a":{"b":{"c":1}}}']);
            expect(() => parse(text, { maxDepth: 3 })).not.toThrow();
            const err = thrown(text, { maxDepth: 2 });
            expect(err.code).toBe('too-deep');
            expect(err.line).toBe(MIN_HEADER.length + 5);
        });

        it('reports missing-tag at the last line when the file has no banner', () => {
            const err = thrown(MIN_HEADER.slice(0, -1).join('\n') + '\n');
            expect(err.code).toBe('missing-tag');
            expect(err.line).toBe(MIN_HEADER.length - 1);
        });

        it('rejects a bad optional count at its own line', () => {
            const err = thrown(small([], [...MIN_HEADER, '[Undos "-1"]']));
            expect(err.code).toBe('bad-count');
            expect(err.line).toBe(MIN_HEADER.length + 1);
        });

        it('rejects a reserved header tag name', () => {
            expect(thrown(small([], [...MIN_HEADER, '[constructor "x"]']).replace('%%% DECKS', '%%% DECKS')).code).toBe('reserved-key');
        });
    });

    describe('positive vectors', () => {
        it('parses every positive vector', () => {
            let n = 0;
            for (const v of manifest.vectors) {
                for (const profile of v.profiles) {
                    const file = parse(readVector(`${v.name}.${profile}.swupgn`));
                    expect(file.header['Game']).toBe('SWU-PGN/0.1');
                    expect(file.decks.length).toBe(2);
                    expect(file.records.length).toBeGreaterThan(0);
                    n++;
                }
            }
            expect(n).toBe(24);
        });
    });

    describe('sections', () => {
        it('keeps STORY verbatim, blank lines inside included', () => {
            const text = small([]).replace('%%% DECKS', '%%% STORY\n\n 1. A plays Wampa\n\n  indented  \n\n\n%%% DECKS');
            expect(parse(text).story).toBe(' 1. A plays Wampa\n\n  indented  ');
        });

        it('does not parse STORY lines as JSON', () => {
            const text = small([]).replace('%%% DECKS', '%%% STORY\n{not json\n\n%%% DECKS');
            expect(parse(text).story).toBe('{not json');
        });

        it('omits story when there is none', () => {
            expect(parse(small([])).story).toBeUndefined();
        });

        it('skips unknown sections into unknownSections', () => {
            const text = small([]) + '\n%%% extra_thing\nnot json\n\nsecond\n';
            const file = parse(text);
            expect(file.unknownSections).toEqual([{ name: 'EXTRA_THING', lines: ['not json', 'second'] }]);
            expect(file.records).toEqual([]);
        });

        it('compares banner names case-insensitively', () => {
            expect(thrown(small([]) + '\n%%% records\n').code).toBe('duplicate-section');
        });

        it('keeps unknown header tags and record types', () => {
            const text = small(['{"t":"future","z":1}'], [...MIN_HEADER, '[Zebra "z"]']);
            const file = parse(text);
            expect(file.header['Zebra']).toBe('z');
            const expected: unknown = { t: 'future', z: 1 };
            expect(file.records[0]).toEqual(expected as SwuRecord);
        });

        it('unescapes header values', () => {
            const text = small([], MIN_HEADER.map((l) => (l.startsWith('[Reason') ? '[Reason "say \\"hi\\" \\\\ ok"]' : l)));
            expect(parse(text).header['Reason']).toBe('say "hi" \\ ok');
        });

        it('accepts several tag pairs on one header line', () => {
            const text = small([], [...MIN_HEADER.slice(0, 17), '[P2Base "SOR#029"] [Zed "1"]']);
            expect(parse(text).header['Zed']).toBe('1');
        });
    });

    describe('line ends and byte order mark', () => {
        it('accepts CRLF and strips a BOM', () => {
            const lf = small(['{"t":"step","seq":0}']);
            const crlf = '﻿' + lf.replace(/\n/g, '\r\n');
            expect(parse(crlf)).toEqual(parse(lf));
        });

        it('strips CR from STORY lines', () => {
            const text = small([]).replace('%%% DECKS', '%%% STORY\nline one\nline two\n%%% DECKS')
                .replace(/\n/g, '\r\n');
            expect(parse(text).story).toBe('line one\nline two');
        });

        it('accepts a last line with no line end', () => {
            const text = small(['{"t":"step","seq":0}']).slice(0, -1);
            expect(parse(text).records.length).toBe(1);
        });

        it('accepts leading blank lines before the Game tag', () => {
            expect(parse('\n\n' + small([])).header['Game']).toBe('SWU-PGN/0.1');
        });
    });
});
