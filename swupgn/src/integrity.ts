import type { GameEvent, ReducedState } from './types';
import { reduce } from './fold';

export interface KeyframeMismatch { seq: string; path: string; expected: unknown; got: unknown; }
export interface IntegrityResult { ok: boolean; mismatches: KeyframeMismatch[]; }

function emptyState(): ReducedState {
    const p = (seat: 1 | 2) => ({ seat, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [] as string[],
        resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [] as string[], cards: [] });
    return { round: 0, phase: 'setup', initiative: null, players: { 1: p(1), 2: p(2) } };
}

/** Compares a small set of fold-tracked invariants against each keyframe. */
function diff(seq: string, expected: ReducedState, got: ReducedState): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    for (const seat of [1, 2] as const) {
        const e = expected.players[seat];
        const g = got.players[seat];
        if (e && g && e.baseHp !== g.baseHp) {
            out.push({ seq, path: `players.${seat}.baseHp`, expected: e.baseHp, got: g.baseHp });
        }
    }
    return out;
}

/** Folds forward; at each keyframe, asserts the running fold equals the keyframe, then snaps to it. */
export function checkKeyframes(events: GameEvent[]): IntegrityResult {
    let s = emptyState();
    const mismatches: KeyframeMismatch[] = [];
    for (const e of events) {
        if ((e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) {
            mismatches.push(...diff(e.seq, e.keyframe, s));
            s = JSON.parse(JSON.stringify(e.keyframe));
            continue;
        }
        s = reduce(s, e);
    }
    return { ok: mismatches.length === 0, mismatches };
}
