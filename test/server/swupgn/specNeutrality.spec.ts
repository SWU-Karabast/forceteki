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
    { phrase: /maps the\s+engine's ability types/, task: 4, why: 'defines ability kinds by one engine\'s class hierarchy' },
    { phrase: /compile error/, task: 4, why: 'describes one implementation\'s type system as the norm' },
    { phrase: /as the engine built it/, task: 5, why: 'defines CHOICE.prompt by one engine\'s UI' },
    { phrase: /engine-internal/, task: 5, why: 'defines ability by one engine\'s identifiers' },
    { phrase: /the engine's zone set/, task: 5, why: 'defines the zone list by one engine instead of the Comprehensive Rules' },
    { phrase: /engine writes the plain text itself when it runs under test/, task: 5, why: 'describes one implementation\'s test mode as the norm' },
    { phrase: /whatever the card's\s+menu entry says/, task: 5, why: 'defines title by one engine\'s menu UI' },
    { phrase: /stopped counting the card as a unit/, task: 6, why: 'describes one engine\'s internal order as the format' },
    { phrase: /after \*\*every\*\* engine event/, task: 6, why: 'defines STATS timing by one engine\'s events' },
    { phrase: /settled inside the engine's cost payment/, task: 6, why: 'defines cost by one engine\'s cost payment' },
    { phrase: /The clamp is the engine's own/, task: 6, why: 'describes one engine\'s behaviour as the rule' },
    { phrase: /the reference\s+writer's does/, task: 6, why: 'describes one implementation\'s output as the norm' },
    { phrase: /the reference writer does not emit/, task: 6, why: 'describes one implementation\'s output as the norm' },
    { phrase: /forceteki writer revisions/, task: 7, why: 'defines the normative text by one writer\'s revision history' },
    { phrase: /reports with a `WriterRevision` bump/, task: 7, why: 'ties the strict wording to a writer revision instead of the spec version' },
    { phrase: /reference host/, task: 8, why: 'names the reference implementation\'s server as the host' },
    { phrase: /\blobby\b/, task: 8, why: 'assumes one platform\'s lobby model' },
    { phrase: /\busername\b/, task: 8, why: 'assumes one platform\'s account model' },
    { phrase: /engine game id/, task: 8, why: 'assumes one engine\'s game id' },
    { phrase: /The reference writer (writes|emits|derives|never sets)/, task: 8, why: 'describes one implementation\'s output as the norm' },
    { phrase: /\breference writer\b/, task: 9, why: 'names the reference writer in normative text' },
    { phrase: /\bforceteki\b/, task: 9, why: 'names one implementation in normative text' },
    { phrase: /\bKarabast\b/, task: 9, why: 'names one project in normative text' },
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

/**
 * The normative lines grouped into paragraphs: runs of consecutive non-blank lines joined with a
 * single space, so a phrase that wraps across a line break still matches. `line` is the first
 * line of the paragraph.
 */
function normativeParagraphs(): { line: number; text: string }[] {
    const out: { line: number; text: string }[] = [];
    let current: { line: number; parts: string[] } | null = null;
    let previous = 0;
    const flush = () => {
        if (current) {
            out.push({ line: current.line, text: current.parts.join(' ') });
            current = null;
        }
    };
    for (const { line, text } of normativeLines()) {
        // A gap in line numbers means lines were excluded between these two, so the paragraph ends.
        if (text.trim() === '' || (current && line !== previous + 1)) {
            flush();
        }
        if (text.trim() !== '') {
            current = current ?? { line, parts: [] };
            current.parts.push(text.trim());
        }
        previous = line;
    }
    flush();
    return out;
}

describe('SWU-PGN spec neutrality', function () {
    it('keeps platform-specific wording out of normative text', function () {
        const paragraphs = normativeParagraphs();
        const hits: string[] = [];
        for (const row of BANNED) {
            for (const { line, text } of paragraphs) {
                const match = row.phrase.exec(text);
                if (match) {
                    hits.push(`task ${row.task} (${row.why}) ${row.phrase} -> paragraph at line ${line}: "${match[0]}"`);
                }
            }
        }
        expect(hits).toEqual([]);
    });

    it('checks a normative region that is not empty', function () {
        // Guards against the `## 1.` heading moving or being renamed, which would make the scan pass vacuously.
        expect(normativeParagraphs().length).toBeGreaterThan(100);
    });

    it('defines the informative note marker', function () {
        const start = specLines.findIndex((l) => (/^## 2\./).test(l));
        const end = specLines.findIndex((l) => (/^## 3\./).test(l));
        expect(specLines.slice(start, end).join('\n')).toContain(NOTE_MARKER);
    });
});
