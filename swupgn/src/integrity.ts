import type { CardInstanceState, GameEvent, PlayerState, ReducedState } from './types';
import { emptyState, isCompleteKeyframe, reduce } from './fold';

export interface KeyframeMismatch { seq: string; path: string; expected: unknown; got: unknown; }
export interface IntegrityResult { ok: boolean; mismatches: KeyframeMismatch[]; }

/**
 * Fields that the keyframe gate verifies, per seat.
 *
 * GATED (reconstructable from the current event model, single source of truth = the
 * event stream): `baseHp`, `handSize`, `resourcesReady`, and per in-play card matched
 * by id: `zone`, `damage`, `exhausted`, `shields`, `experience`, `statusTokens`.
 * `baseHp` is exempt at the first keyframe only — see checkKeyframes for why.
 *
 * NOT GATED (and why): nothing in the per-seat invariant set above is currently deferred.
 * The keyframe's `cards` array only contains ground/space arena cards (see
 * SwuPgnGameAdapter.buildSwuPgnPlayerState), so card-level checks are scoped to arena cards by
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

function diffSeat(seq: string, seat: 1 | 2, e: PlayerState, g: PlayerState, checkBaseHp: boolean): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    if (checkBaseHp && e.baseHp !== g.baseHp) {
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
function diff(seq: string, expected: ReducedState, got: ReducedState, checkBaseHp: boolean): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    for (const seat of [1, 2] as const) {
        const e = expected.players[seat];
        const g = got.players[seat];
        if (e && g) {
            out.push(...diffSeat(seq, seat, e, g, checkBaseHp));
        }
    }
    return out;
}

/**
 * Folds forward; at each keyframe, asserts the running fold equals the keyframe, then snaps to it.
 *
 * `baseHp` is exempt at the FIRST keyframe only. Nothing in the event stream carries a
 * base's starting HP — `emptyState()` seeds a placeholder 30, but real bases vary (33, 28,
 * ...), so before the first keyframe the fold has no way to know the true value and a
 * comparison there tests the placeholder, not the file. The first keyframe is what supplies
 * the real HP; the fold snaps to it, and every keyframe after that IS compared, since from
 * then on `baseHp` is fully driven by DAMAGE/HEAL/OVERWHELM (which carry absolute `hp`).
 * Every other gated field is compared at every keyframe, first one included.
 */
export function checkKeyframes(events: GameEvent[]): IntegrityResult {
    let s = emptyState();
    const mismatches: KeyframeMismatch[] = [];
    let seenKeyframe = false;
    for (const e of events) {
        if ((e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) {
            // A keyframe missing a seat, or malformed, is a damaged checkpoint (spec §13): it
            // is reported, never snapped to, and folding carries on from the running state.
            if (!isCompleteKeyframe(e.keyframe)) {
                mismatches.push({ seq: e.seq, path: 'keyframe', expected: 'both seats, with array cards/hand/discard', got: 'damaged keyframe (ignored)' });
                s = reduce(s, e);
                continue;
            }
            mismatches.push(...diff(e.seq, e.keyframe, s, seenKeyframe));
            seenKeyframe = true;
            s = JSON.parse(JSON.stringify(e.keyframe));
            continue;
        }
        s = reduce(s, e);
    }
    return { ok: mismatches.length === 0, mismatches };
}
