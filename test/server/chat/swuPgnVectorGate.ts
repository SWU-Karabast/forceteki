import * as fs from 'fs';
import * as path from 'path';
import { parse, fold, render, validate } from '../../../swupgn/src/index';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import type { SwuPgnDocument } from '../../../swupgn/src/types';

const VECTOR_DIR = path.resolve(__dirname, '../../../../swupgn/test-vectors');

/**
 * Keyframe fields the integration harness makes unreconstructable past the first keyframe.
 *
 * `setupTestAsync` bootstraps a game AT the action phase by placing cards directly, after the
 * natural setup phase has already dealt a real hand and resources, and that teardown emits no
 * MOVE. So the fold keeps the stale remnant in these counts and lists. `hand` CONTENTS share
 * handSize's cause exactly; `discard` is NOT here -- it reconstructs cleanly even so. A
 * production game has exactly one setup, and the organic-game vectors gate every field.
 */
const HARNESS_DEFERRED_SUFFIXES = ['.handSize', '.resourcesReady', '.deckSize', '.hand', '.resources'];

/** True for a keyframe mismatch that is that harness artifact rather than a fold or writer bug. */
export function isHarnessCountArtifact(m: { seq: string; path: string }): boolean {
    return m.seq !== 'R1.start' && HARNESS_DEFERRED_SUFFIXES.some((f) => m.path.endsWith(f));
}

/**
 * Hold a real writer output to a normative vector (spec §20), and regenerate the vector from it.
 *
 * A vector is three files: the `.swupgn` the writer produced, and the `.fold.json` / `.render.txt`
 * the reference reader derives from it. The header of a fresh file differs run to run (GameId,
 * Date, the salted player ids), so what is pinned is what the header does not touch: the fold and
 * the story, byte for byte. If either moves, the writer's output for this scenario changed --
 * regenerate deliberately with `SWUPGN_WRITE_VECTORS=1 npm test`, review the diff, and update
 * the spec's §20/§22 tables.
 *
 * Every vector also has to be clean on its own terms: no validator issue, and a keyframe gate
 * with nothing to report, so a reader learning the rules from it learns the right ones.
 */
export function vectorGate(name: string, text: string): SwuPgnDocument {
    const doc = parse(text);
    const folded = JSON.stringify(fold(doc.events), null, 2) + '\n';
    const story = render(doc) + '\n';

    if (process.env.SWUPGN_WRITE_VECTORS) {
        fs.writeFileSync(path.join(VECTOR_DIR, `${name}.swupgn`), text);
        fs.writeFileSync(path.join(VECTOR_DIR, `${name}.fold.json`), folded);
        fs.writeFileSync(path.join(VECTOR_DIR, `${name}.render.txt`), story);
    }

    expect(validate(text).issues).withContext(`${name}: validate()`)
        .toEqual([]);
    expect(checkKeyframes(doc.events).mismatches).withContext(`${name}: keyframe gate`)
        .toEqual([]);
    expect(doc.header.recorderErrors).withContext(`${name}: RecorderErrors`)
        .toBeUndefined();

    const expectedFold = fs.readFileSync(path.join(VECTOR_DIR, `${name}.fold.json`), 'utf8');
    const expectedStory = fs.readFileSync(path.join(VECTOR_DIR, `${name}.render.txt`), 'utf8');
    expect(folded).withContext(`${name}: fold.json (regenerate with SWUPGN_WRITE_VECTORS=1 if the change is intended)`)
        .toBe(expectedFold);
    expect(story).withContext(`${name}: render.txt (regenerate with SWUPGN_WRITE_VECTORS=1 if the change is intended)`)
        .toBe(expectedStory);

    // Value: protects=a real game's [W-18] `for` links stay the reviewed ones; fails_when=a recorder or linker change moves, adds or drops a `for` in a real game; why_new=the fold and the story ignore `for`, and writerLinks.spec reads the committed files, never a fresh one; seam=none; no_claim=links in plays no vector contains (Exploit, alternate costs)
    const committed = parse(fs.readFileSync(path.join(VECTOR_DIR, `${name}.swupgn`), 'utf8'));
    expect(forLinks(doc)).withContext(`${name}: for links (regenerate with SWUPGN_WRITE_VECTORS=1 if the change is intended)`)
        .toEqual(forLinks(committed));
    return doc;
}

/** Each record's `for`, by seq: what the fold and the story leave out. */
function forLinks(doc: SwuPgnDocument): Record<string, string> {
    const links: Record<string, string> = {};
    for (const e of doc.events) {
        const link = (e as { for?: unknown }).for;
        if (typeof link === 'string') {
            links[e.seq] = link;
        }
    }
    return links;
}
