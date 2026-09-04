import type { SwuPgnDocument, Header } from '../../../../swupgn/src/types';
import { checkKeyframes } from '../../../../swupgn/src/integrity';
import { logger } from '../../../logger';

/** Cap on how many mismatches are logged, so a systematically broken stream can't flood the log. */
const MAX_LOGGED_MISMATCHES = 10;

/** Order of header tags in the emitted file (mirrors the spec §6 table). */
const HEADER_TAG_ORDER: [keyof Header, string][] = [
    ['game', 'Game'], ['gameId', 'GameId'], ['date', 'Date'], ['format', 'Format'],
    ['cardPool', 'CardPool'], ['engine', 'Engine'], ['seed', 'Seed'], ['perspective', 'Perspective'],
    ['p1Id', 'P1Id'], ['p2Id', 'P2Id'], ['p1', 'P1'], ['p2', 'P2'],
    ['p1Leader', 'P1Leader'], ['p1Base', 'P1Base'], ['p2Leader', 'P2Leader'], ['p2Base', 'P2Base'],
    ['result', 'Result'], ['reason', 'Reason'], ['rounds', 'Rounds'],
];

function escapeTag(value: string): string {
    return value
        .replace(/[\r\n]+/g, ' ')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
}

export class SwuPgnWriter {
    public write(doc: SwuPgnDocument): string {
        this.verifyKeyframes(doc);

        const lines: string[] = [];

        for (const [key, tag] of HEADER_TAG_ORDER) {
            const v = doc.header[key];
            if (v == null || v === '') {
                continue; // optional tags (Format, Perspective) omitted when absent
            }
            lines.push(`[${tag} "${escapeTag(String(v))}"]`);
        }

        // STORY comes FIRST, right after the header, so someone who opens the file reads the
        // game instead of scrolling past 500 lines of JSON to find it. It is derived from the
        // rest of the file (see the render gate in SwuPgnWriterContract.spec.ts) and can be
        // stripped by a size-constrained consumer without losing anything.
        if (doc.story && doc.story.length > 0) {
            lines.push('', '%%% STORY', ...doc.story);
        }
        lines.push('', '%%% DECKS');
        for (const d of doc.decks) {
            lines.push(JSON.stringify(d));
        }
        lines.push('', '%%% CARDS');
        for (const c of doc.cards ?? []) {
            lines.push(JSON.stringify(c));
        }
        lines.push('', '%%% SETUP');
        for (const s of doc.setup) {
            lines.push(JSON.stringify(s));
        }
        lines.push('', '%%% EVENTS');
        for (const e of doc.events) {
            lines.push(JSON.stringify(e));
        }
        lines.push('', '%%% ANNOTATIONS');
        for (const a of doc.annotations) {
            lines.push(JSON.stringify(a));
        }

        return lines.join('\n') + '\n';
    }

    /**
     * Run the spec §14 integrity gate: fold the event stream forward and assert it matches
     * every embedded keyframe.
     *
     * A mismatch means the deltas between two keyframes don't fully account for what the
     * engine reports, i.e. the file under-records something. It is logged as an error with
     * the offending paths so it is actionable, but it does NOT block emission: the keyframes
     * themselves remain authoritative, so a reader that trusts them still reconstructs every
     * round boundary correctly, and refusing to emit would cost the player their whole
     * replay to fix a partial-fidelity problem. Never let the gate itself break generation.
     */
    private verifyKeyframes(doc: SwuPgnDocument): void {
        try {
            const result = checkKeyframes(doc.events);
            if (result.ok) {
                return;
            }
            const shown = result.mismatches.slice(0, MAX_LOGGED_MISMATCHES);
            const elided = result.mismatches.length - shown.length;
            logger.error(
                `SwuPgnWriter: keyframe integrity check failed with ${result.mismatches.length} mismatch(es)` +
                `${elided > 0 ? ` (showing first ${shown.length})` : ''}: ${JSON.stringify(shown)}`
            );
        } catch (error) {
            logger.warn(`SwuPgnWriter: keyframe integrity check could not run: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
