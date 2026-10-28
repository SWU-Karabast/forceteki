import * as fs from 'fs';
import * as path from 'path';

/**
 * SWU-PGN is a standard any platform can write and read, so the normative text must not lean on
 * one implementation. This guard fails when normative lines use wording tied to the reference
 * writer or reader. Informative text may still name forceteki: it lives in the appendices, in
 * the version history, or in a block that starts `> **Note (informative):**`.
 *
 * Later tasks of the platform-neutral plan append rows to BANNED.
 */

const root = path.resolve(__dirname, '../../../..');
const specLines = fs.readFileSync(path.join(root, 'docs/SWU-PGN-1.0-SPEC.md'), 'utf8').split('\n');

const NOTE_MARKER = '> **Note (informative):**';

export const BANNED: { phrase: RegExp; task: number; why: string }[] = [
    { phrase: /\blinkActionSteps\(/, task: 1, why: 'names a reference-writer function' },
    { phrase: /\bcheckKeyframes\(/, task: 1, why: 'names a reference-reader function' },
    { phrase: /\bemptyState\(/, task: 1, why: 'names a reference-reader function' },
    { phrase: /Real engine files/, task: 1, why: 'describes one implementation\'s output as the norm' },
    { phrase: /server\/game\/core\/chat/, task: 1, why: 'names a path in one implementation' },
    { phrase: /internal name/i, task: 2, why: 'defines a token name by one implementation\'s card key' },
    { phrase: /<internalName>/, task: 2, why: 'defines a token name by one implementation\'s card key' },
    { phrase: /performs part of an action\s+\*?before\*? it announces/, task: 3, why: 'describes one engine\'s emission order as the format' },
    { phrase: /The \*recorder\* genuinely cannot/, task: 3, why: 'describes one implementation\'s recorder' },
    { phrase: /in every real file/, task: 3, why: 'describes one implementation\'s output as the norm' },
];

/** The lines a conforming implementation must obey, with 1-based line numbers. */
function normativeLines(): { line: number; text: string }[] {
    const out: { line: number; text: string }[] = [];
    let started = false;
    let inCode = false;
    let inSection22 = false;
    let inNote = false;
    for (let i = 0; i < specLines.length; i++) {
        const text = specLines[i];
        if ((/^## Appendix C/).test(text)) {
            break;
        }
        if ((/^## 1\./).test(text)) {
            started = true;
        }
        if (!started) {
            continue;
        }
        if ((/^```/).test(text.trim())) {
            inCode = !inCode;
            continue;
        }
        if (inCode) {
            continue;
        }
        if ((/^## /).test(text)) {
            inSection22 = (/^## 22\./).test(text);
        }
        if (inSection22) {
            continue;
        }
        if (text.startsWith(NOTE_MARKER)) {
            inNote = true;
        } else if (inNote && !text.startsWith('>')) {
            inNote = false;
        }
        if (inNote) {
            continue;
        }
        if (text.includes('**Applications that use this media type:**')) {
            continue;
        }
        out.push({ line: i + 1, text });
    }
    return out;
}

describe('SWU-PGN spec neutrality', function () {
    it('keeps platform-specific wording out of normative text', function () {
        const lines = normativeLines();
        const hits: string[] = [];
        for (const row of BANNED) {
            for (const { line, text } of lines) {
                if (row.phrase.test(text)) {
                    hits.push(`task ${row.task} (${row.why}) ${row.phrase} -> ${line}: ${text}`);
                }
            }
        }
        expect(hits).toEqual([]);
    });

    it('defines the informative note marker', function () {
        const start = specLines.findIndex((l) => (/^## 2\./).test(l));
        const end = specLines.findIndex((l) => (/^## 3\./).test(l));
        expect(specLines.slice(start, end).join('\n')).toContain(NOTE_MARKER);
    });
});
