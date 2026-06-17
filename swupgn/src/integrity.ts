import type { CardInstanceState, GameEvent, PlayerState, ReducedState } from './types';
import { reduce } from './fold';

export interface KeyframeMismatch { seq: string; path: string; expected: unknown; got: unknown; }
export interface IntegrityResult { ok: boolean; mismatches: KeyframeMismatch[]; }

function emptyState(): ReducedState {
    const p = (seat: 1 | 2) => ({ seat, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [] as string[],
        resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [] as string[], cards: [] });
    return { round: 0, phase: 'setup', initiative: null, players: { 1: p(1), 2: p(2) } };
}

/**
 * Fields that the keyframe gate verifies, per seat.
 *
 * GATED (reconstructable from the current event model, single source of truth = the
 * event stream): `baseHp`, `handSize`, `resourcesReady`, and per in-play card matched
 * by id: `zone`, `damage`, `exhausted`, `shields`, `experience`, `statusTokens`.
 *
 * NOT GATED (and why): nothing in the per-seat invariant set above is currently deferred.
 * The keyframe's `cards` array only contains ground/space arena cards (see
 * Game.buildSwuPgnPlayerState), so card-level checks are scoped to arena cards by
 * construction; hand/resource/discard piles are compared via the count fields, not
 * per-card. `credits`, `hasForce`, `resourcesExhausted`, `hand`/`discard` contents and
 * `upgrades` are intentionally OUT of scope for this gate — they are not yet driven by
 * dedicated fold deltas (credits/force have no events; upgrade nesting is not modelled).
 * Closing those is a Plan-3 completeness item; see SwuPgnKeyframeCompleteness.spec.ts.
 *
 * NOTE on handSize/resourcesReady: the fold reconstructs these from MOVE events (the
 * engine's source of truth for zone transitions; see fold.applyMoveCounts), so they ARE
 * gated here. They are only unreconstructable when a producer removes a card from a zone
 * WITHOUT emitting a corresponding MOVE — which in practice happens only under the
 * integration test harness's double-setup (GameStateBuilder), not in a production game.
 * The real-game completeness spec documents and isolates that test-harness artifact rather
 * than relaxing this diff; see SwuPgnKeyframeCompleteness.spec.ts (Plan-3 note).
 */
function diffCard(seq: string, seat: 1 | 2, e: CardInstanceState, g: CardInstanceState): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    const base = `players.${seat}.cards[${e.id}]`;
    if (e.zone !== g.zone) {
        out.push({ seq, path: `${base}.zone`, expected: e.zone, got: g.zone });
    }
    if (e.damage !== g.damage) {
        out.push({ seq, path: `${base}.damage`, expected: e.damage, got: g.damage });
    }
    if (e.exhausted !== g.exhausted) {
        out.push({ seq, path: `${base}.exhausted`, expected: e.exhausted, got: g.exhausted });
    }
    if (e.shields !== g.shields) {
        out.push({ seq, path: `${base}.shields`, expected: e.shields, got: g.shields });
    }
    if (e.experience !== g.experience) {
        out.push({ seq, path: `${base}.experience`, expected: e.experience, got: g.experience });
    }
    if (JSON.stringify(e.statusTokens ?? {}) !== JSON.stringify(g.statusTokens ?? {})) {
        out.push({ seq, path: `${base}.statusTokens`, expected: e.statusTokens, got: g.statusTokens });
    }
    return out;
}

function diffSeat(seq: string, seat: 1 | 2, e: PlayerState, g: PlayerState): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    if (e.baseHp !== g.baseHp) {
        out.push({ seq, path: `players.${seat}.baseHp`, expected: e.baseHp, got: g.baseHp });
    }
    if (e.handSize !== g.handSize) {
        out.push({ seq, path: `players.${seat}.handSize`, expected: e.handSize, got: g.handSize });
    }
    if (e.resourcesReady !== g.resourcesReady) {
        out.push({ seq, path: `players.${seat}.resourcesReady`, expected: e.resourcesReady, got: g.resourcesReady });
    }

    // Match in-play cards by id. Report cards present in one side but not the other.
    const gotById = new Map(g.cards.map((c) => [c.id, c]));
    const expectedById = new Map(e.cards.map((c) => [c.id, c]));
    for (const ec of e.cards) {
        const gc = gotById.get(ec.id);
        if (!gc) {
            out.push({ seq, path: `players.${seat}.cards[${ec.id}]`, expected: 'present', got: 'absent' });
            continue;
        }
        out.push(...diffCard(seq, seat, ec, gc));
    }
    for (const gc of g.cards) {
        if (!expectedById.has(gc.id)) {
            out.push({ seq, path: `players.${seat}.cards[${gc.id}]`, expected: 'absent', got: 'present' });
        }
    }
    return out;
}

/** Compares the gated set of fold-tracked invariants against each keyframe (see above). */
function diff(seq: string, expected: ReducedState, got: ReducedState): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    for (const seat of [1, 2] as const) {
        const e = expected.players[seat];
        const g = got.players[seat];
        if (e && g) {
            out.push(...diffSeat(seq, seat, e, g));
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
