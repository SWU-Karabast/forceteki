import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ERROR_CODES } from '../src/registry';

/**
 * SPEC.md is the hand-off artifact other platforms integrate against. These checks keep its
 * generated registry tables in sync, its requirement ids well formed, and its normative text
 * free of wording tied to one implementation.
 */

const packageDir = path.resolve(__dirname, '..', '..');
const specPath = path.join(packageDir, 'SPEC.md');

function specLines(): string[] {
    return fs.readFileSync(specPath, 'utf8').split('\n');
}

const NOTE_MARKER = '> **Note (informative):**';

/** Phrases that tie normative text to one implementation, platform or test tool. */
const BANNED: { phrase: RegExp; why: string }[] = [
    { phrase: /Real engine files/, why: 'describes one implementation\'s output as the norm' },
    { phrase: /server\/game\/core\/chat/, why: 'names a path in one implementation' },
    { phrase: /internal name/i, why: 'defines a token name by one implementation\'s card key' },
    { phrase: /<internalName>/, why: 'defines a token name by one implementation\'s card key' },
    { phrase: /performs part of an action\s+\*?before\*? it announces/, why: 'describes one engine\'s emission order as the format' },
    { phrase: /The \*recorder\* genuinely cannot/, why: 'describes one implementation\'s recorder' },
    { phrase: /in every real file/, why: 'describes one implementation\'s output as the norm' },
    { phrase: /maps the\s+engine's ability types/, why: 'defines ability kinds by one engine\'s class hierarchy' },
    { phrase: /compile error/, why: 'describes one implementation\'s type system as the norm' },
    { phrase: /as the engine built it/, why: 'defines a prompt by one engine\'s UI' },
    { phrase: /engine-internal/, why: 'defines an ability by one engine\'s identifiers' },
    { phrase: /the engine's zone set/, why: 'defines the zone list by one engine instead of the Comprehensive Rules' },
    { phrase: /engine writes the plain text itself when it runs under test/, why: 'describes one implementation\'s test mode as the norm' },
    { phrase: /whatever the card's\s+menu entry says/, why: 'defines a title by one engine\'s menu UI' },
    { phrase: /stopped counting the card as a unit/, why: 'describes one engine\'s internal order as the format' },
    { phrase: /after \*\*every\*\* engine event/, why: 'defines timing by one engine\'s events' },
    { phrase: /settled inside the engine's cost payment/, why: 'defines cost by one engine\'s cost payment' },
    { phrase: /The clamp is the engine's own/, why: 'describes one engine\'s behaviour as the rule' },
    { phrase: /the reference\s+writer's does/, why: 'describes one implementation\'s output as the norm' },
    { phrase: /the reference writer does not emit/, why: 'describes one implementation\'s output as the norm' },
    { phrase: /forceteki writer revisions/, why: 'defines the normative text by one writer\'s revision history' },
    { phrase: /reports with a `WriterRevision` bump/, why: 'ties the wording to a writer revision instead of the spec version' },
    { phrase: /reference host/, why: 'names the reference implementation\'s server as the host' },
    { phrase: /\blobby\b/, why: 'assumes one platform\'s lobby model' },
    { phrase: /\busername\b/, why: 'assumes one platform\'s account model' },
    { phrase: /engine game id/, why: 'assumes one engine\'s game id' },
    { phrase: /The reference writer (writes|emits|derives|never sets)/, why: 'describes one implementation\'s output as the norm' },
    { phrase: /\breference writer\b/, why: 'names the reference writer in normative text' },
    { phrase: /\bforceteki\b/, why: 'names one implementation in normative text' },
    { phrase: /\bKarabast\b/, why: 'names one project in normative text' },
    { phrase: /\breference (reader|validator)\b/, why: 'names the reference reader or validator in normative text' },
    { phrase: /\btoken image pipeline\b/, why: 'names one platform\'s art pipeline, a term the format does not define' },
    { phrase: /\bforceteki\b/i, why: 'names one implementation in normative text' },
    { phrase: /\bkarabast\b/i, why: 'names one platform in normative text' },
    { phrase: /\bjasmine\b/i, why: 'names one test tool in normative text' },
];

/**
 * The lines a conforming implementation must obey, with 1-based line numbers: from `## 1.` on,
 * leaving out code blocks, informative notes, and every `##` section whose heading says it is
 * informative.
 */
function normativeLines(): { line: number; text: string }[] {
    const lines = specLines();
    const out: { line: number; text: string }[] = [];
    let started = false;
    let inCode = false;
    let inInformative = false;
    let inNote = false;
    for (let i = 0; i < lines.length; i++) {
        const text = lines[i];
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
            inInformative = (/\(informative\)/).test(text);
        }
        if (inInformative) {
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
        out.push({ line: i + 1, text });
    }
    return out;
}

/** Normative lines joined into paragraphs, so a phrase that wraps across a line break still matches. */
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

/** The lines of the `##` section whose heading starts with `prefix`. */
function section(prefix: string): string {
    const lines = specLines();
    const start = lines.findIndex((l) => l.startsWith(`## ${prefix}`));
    if (start < 0) {
        throw new Error(`no section ## ${prefix}`);
    }
    const end = lines.findIndex((l, i) => i > start && (/^## /).test(l));
    return lines.slice(start, end < 0 ? undefined : end).join('\n');
}

describe('SPEC.md', function () {
    it('exists', function () {
        expect(fs.existsSync(specPath)).toBe(true);
    });

    it('registry tables are in sync', function () {
        const result = spawnSync(process.execPath, [path.join(packageDir, 'scripts', 'gen-spec-tables.mjs'), '--check'], { cwd: packageDir, encoding: 'utf8' });
        expect(result.status).toBe(0, result.stderr);
    });

    it('requirement ids are unique and each defined once', function () {
        const lines = specLines();
        const definitionSite = /^- \*\*\[([WPARVH]-\d{2})\]\*\*/;
        const defined = new Map<string, number>();
        const duplicates: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const match = definitionSite.exec(lines[i]);
            if (match) {
                if (defined.has(match[1])) {
                    duplicates.push(`${match[1]} at lines ${defined.get(match[1])} and ${i + 1}`);
                }
                defined.set(match[1], i + 1);
            }
        }
        expect(duplicates).toEqual([]);
        expect(defined.size).toBeGreaterThan(30);

        const undefinedRefs: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            for (const match of lines[i].matchAll(/\[([WPARVH]-\d{2})\]/g)) {
                if (!defined.has(match[1])) {
                    undefinedRefs.push(`${match[1]} at line ${i + 1}`);
                }
            }
        }
        expect(undefinedRefs).toEqual([]);

        // A requirement-shaped id with any other letter is a typo.
        const strays = lines.flatMap((l, i) => [...l.matchAll(/\[([A-Z])-\d{2}\]/g)].filter((m) => !'WPARVH'.includes(m[1])).map((m) => `${m[0]} at line ${i + 1}`));
        expect(strays).toEqual([]);
    });

    it('normative sections are platform-neutral', function () {
        const paragraphs = normativeParagraphs();
        const hits: string[] = [];
        for (const row of BANNED) {
            for (const { line, text } of paragraphs) {
                const match = row.phrase.exec(text);
                if (match) {
                    hits.push(`(${row.why}) ${row.phrase} -> paragraph at line ${line}: "${match[0]}"`);
                }
            }
        }
        expect(hits).toEqual([]);
    });

    it('checks a normative region that is not empty', function () {
        // Guards against the `## 1.` heading moving, which would make the neutrality scan pass vacuously.
        expect(normativeParagraphs().length).toBeGreaterThan(150);
    });

    it('defines the informative note marker in §2', function () {
        expect(section('2.')).toContain(NOTE_MARKER);
    });

    it('every error code in the registry appears in §Error model', function () {
        const text = section('21.');
        expect(text).toMatch(/^## 21\. Error model/);
        const missing = ERROR_CODES.map((c) => c.code).filter((code) => !text.includes(`\`${code}\``));
        expect(missing).toEqual([]);
    });

    it('§22.4 renders each block kind\'s field contract', function () {
        const text = section('22.');
        expect(text).toContain('| Kind | Meaning | Required | Optional | Fields mean |');
        expect(text).toMatch(/\| `attack` \| [^|]+ \| `p`, `src`, `targets` \| `via` \|/);
    });

    it('§11.2 runs step 0 (losing track in a hidden hand) before step 1', function () {
        const text = section('11.');
        const stepZero = text.indexOf('- **[R-17]** Step 0,');
        const stepOne = text.indexOf('- **[R-01]** Step 1,');
        expect(stepZero).toBeGreaterThan(0);
        expect(stepZero).toBeLessThan(stepOne);
    });

    it('§16.2 lists the hidden-hand knowledge loss', function () {
        expect(section('16.')).toMatch(/Which known card left a hidden hand\.\*\*[^\n]*\[R-17\]/);
    });

    it('R-17 has no reveal exception, and anonymous creates carry only the entity\'s own seat as to', function () {
        const text = section('11.');
        const stepZero = text.split('\n').find((l) => l.startsWith('- **[R-17]**')) ?? '';
        expect(stepZero).toContain('applies even when the moving entity was revealed to V');
        expect(stepZero).not.toMatch(/does not apply when a `reveal`/);
        for (const id of ['R-02', 'R-05']) {
            const line = text.split('\n').find((l) => l.startsWith(`- **[${id}]**`)) ?? '';
            expect(line).toMatch(/`to` set to the entity's own seat/);
            expect(line).not.toMatch(/current audience as `to`, and only its public attributes/);
        }
    });

    it('R-09 drops references to cards in a hidden hand', function () {
        const line = section('11.').split('\n')
            .find((l) => l.startsWith('- **[R-09]**')) ?? '';
        expect(line).toMatch(/not, when the block applies, in a `hand` whose seat is not V/);
    });

    it('the §Example appendix equals vectors/tiny.*', function () {
        const appendix = specLines().join('\n')
            .split('## Appendix A: Example (informative)')[1].split('\n## Appendix B')[0];
        const blocks = [...appendix.matchAll(/^```ndjson\n([\s\S]*?)^```$/gm)].map((m) => m[1].split('\n').filter((l) => l !== ''));
        const records = (profile: string) => {
            const lines = fs.readFileSync(path.join(packageDir, 'vectors', `tiny.${profile}.swupgn`), 'utf8').split('\n');
            const start = lines.indexOf('%%% RECORDS') + 1;
            const end = lines.findIndex((l, i) => i >= start && l.startsWith('%%%'));
            return lines.slice(start, end < 0 ? undefined : end).filter((l) => l !== '');
        };
        expect(blocks.length).toBe(2);
        expect(blocks[0]).toEqual(records('full'));
        expect(blocks[1]).toEqual(records('p1'));
    });
});
