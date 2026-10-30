import * as fs from 'fs';
import * as path from 'path';

/**
 * Every record the spec quotes in a code block is a real one. The spec teaches by example, and an
 * example that matches no vector teaches a shape the writer does not produce: a 2026-10 review
 * found a dozen quotes left behind by regenerated vectors (stale seqs, a pilot played at the
 * wrong cost, a card in no game at all). `ms` is compared too: it is wall-clock time and changes
 * whenever a vector is regenerated, so a regeneration means updating the quotes, and the failure
 * names the value the vector now holds.
 */

const root = path.resolve(__dirname, '../../../..');
const specLines = fs.readFileSync(path.join(root, 'docs/SWU-PGN-1.0-SPEC.md'), 'utf8').split('\n');
const vectorDir = path.join(root, 'swupgn/test-vectors');

/** A record as a comparable string: keys sorted, `ms` dropped so a stale one can be named. */
function normalise(record: Record<string, unknown>): string {
    const copy = { ...record };
    delete copy.ms;
    return JSON.stringify(copy, Object.keys(copy).sort());
}

/** Every `{"seq":…}` record inside a fenced code block, with the line it starts on. A record may wrap. */
function quotedRecords(): { line: number; record: Record<string, unknown> }[] {
    const out: { line: number; record: Record<string, unknown> }[] = [];
    let inCode = false;
    let buffer: string | null = null;
    let start = 0;
    specLines.forEach((raw, i) => {
        if ((/^\s*```/).test(raw)) {
            inCode = !inCode;
            buffer = null;
            return;
        }
        const text = raw.trim();
        if (!inCode || (buffer === null && !text.startsWith('{"seq":'))) {
            return;
        }
        if (buffer === null) {
            start = i + 1;
        }
        buffer = (buffer ?? '') + text;
        try {
            out.push({ line: start, record: JSON.parse(buffer) });
            buffer = null;
        } catch {
            // Not closed yet: the record wraps onto the next line.
        }
    });
    return out;
}

describe('SWU-PGN spec examples', function () {
    // Value: protects=every record the spec quotes exists in a test vector; fails_when=a vector is regenerated or the writer changes and a quoted seq, field, value or ms no longer matches; why_new=nothing compared the spec's examples with the vectors, and a dozen had drifted; seam=none; no_claim=prose that names a seq outside a code block is not checked
    it('quotes only records that exist in a test vector', function () {
        // Each record without its `ms`, mapped to the `ms` values it carries in the vectors.
        const known = new Map<string, Set<unknown>>();
        for (const file of fs.readdirSync(vectorDir).filter((f) => f.endsWith('.swupgn'))) {
            for (const line of fs.readFileSync(path.join(vectorDir, file), 'utf8').split('\n')) {
                if (line.startsWith('{')) {
                    const record = JSON.parse(line) as Record<string, unknown>;
                    const key = normalise(record);
                    known.set(key, (known.get(key) ?? new Set()).add(record.ms));
                }
            }
        }
        const quotes = quotedRecords();
        expect(quotes.length).withContext('the spec quotes records')
            .toBeGreaterThan(50);
        const missing = quotes.filter((q) => !known.has(normalise(q.record)))
            .map((q) => `spec line ${q.line}: ${JSON.stringify(q.record).slice(0, 120)}`);
        expect(missing).toEqual([]);
        const staleMs = quotes.filter((q) => known.get(normalise(q.record))?.has(q.record.ms) === false)
            .map((q) => `spec line ${q.line}: ${String(q.record.seq)} has ms ${String(q.record.ms)}, the vector has ${[...known.get(normalise(q.record))].map(String).join(' or ')}`);
        expect(staleMs).toEqual([]);
    });
});
