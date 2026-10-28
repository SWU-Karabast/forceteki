import type { AbilityUse, ActiveEffect, CardInstanceState, GameEvent, PlayerState, ReducedState } from './types';
import { clearAbilityUses, emptyState, isCompleteKeyframe, reduce, snapTo } from './fold';

export interface KeyframeMismatch {
    seq: string; path: string; expected: unknown; got: unknown;
}
export interface IntegrityResult {
    ok: boolean; mismatches: KeyframeMismatch[];
}

/** Order-free comparison of two id lists; a missing list is an empty one (older files). */
function sameSet(a: unknown, b: unknown): boolean {
    const norm = (x: unknown) => (Array.isArray(x) ? [...x].map(String).sort() : []);
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/** Two status-token maps hold the same names and counts, in whatever key order. */
function sameTokens(a: unknown, b: unknown): boolean {
    const norm = (x: unknown) => Object.entries(x && typeof x === 'object' ? x : {}).sort(([k1], [k2]) => (k1 < k2 ? -1 : k1 > k2 ? 1 : 0));
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/**
 * Fields that the keyframe gate verifies, per seat.
 *
 * GATED (reconstructable from the event model, single source of truth = the event stream):
 * `initiativeTaken`; `effects` (as a set by id, see sameEffects); per seat `baseHp`, `handSize`, `deckSize`, `resourcesReady`,
 * `resourcesExhausted`, `credits`, `hasForce`, `baseEpicActionUsed`, the leader's `id`/
 * `deployed`/`exhausted`/`epicActionUsed`/`onStartingSide`; `hand` (as a set — a hand is
 * unordered), `discard` (in order — the pile is), `resources`, `baseUpgrades` and
 * `baseCaptured` (as sets), `abilityUses` (as a set by card and ability, see sameUses) and
 * `baseDefeated` (a boolean, absent read as false); and per
 * in-play card matched by id: `zone`, `damage`, `exhausted`, `shields`,
 * `experience`, `statusTokens`, `upgrades` and `captured` (both as sets — attachment order is
 * not part of the model), `power`, `hp` and `keywords` (the live values `STATS` records carry).
 * `baseHp` and `deckSize` are exempt at the first keyframe only — see checkKeyframes. Fields an
 * older file's keyframe lacks (`deckSize`, `leader`, `power`, `hp`, `keywords`,
 * `initiativeTaken`, `resources`, `baseUpgrades`, `baseCaptured`, `effects`, `abilityUses`) are skipped: absent is "not recorded", not "zero".
 *
 * `hand`/`discard` CONTENTS were previously ungated, on the belief that only the counts were
 * reconstructable. They are not: every MOVE names its card, so both lists are exact. The fold
 * used to grow `hand[]` from DRAW and never remove, and to leave `discard` to DEFEAT — which
 * fires AFTER the MOVE that already emptied `cards`, so no defeated unit ever reached the pile.
 * Both are now MOVE-driven and gated here; the five vectors of the time produced 45 mismatches
 * before the fix and none after.
 *
 * The keyframe's `cards` array only contains ground/space arena cards (see
 * SwuPgnGameAdapter.buildSwuPgnPlayerState), so card-level checks are scoped to arena cards
 * by construction.
 *
 * NOTE on handSize/resources: the fold reconstructs these from MOVE events (the engine's
 * source of truth for zone transitions; see fold.applyMoveCounts) plus EXHAUST_RESOURCES /
 * READY_RESOURCES for the ready/exhausted split, so they ARE gated here. They are only
 * unreconstructable when a producer removes a card from a zone WITHOUT emitting a MOVE —
 * which in practice happens only under the integration test harness's double-setup
 * (GameStateBuilder), not in a production game. See SwuPgnKeyframeCompleteness.spec.ts.
 */
function diffCard(seq: string, seat: 1 | 2, e: CardInstanceState, g: CardInstanceState): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    const base = `players.${seat}.cards[${e.id}]`;
    for (const field of ['zone', 'damage', 'exhausted', 'shields', 'experience'] as const) {
        if (e[field] !== g[field]) {
            out.push({ seq, path: `${base}.${field}`, expected: e[field], got: g[field] });
        }
    }
    if (!sameTokens(e.statusTokens, g.statusTokens)) {
        out.push({ seq, path: `${base}.statusTokens`, expected: e.statusTokens, got: g.statusTokens });
    }
    for (const field of ['upgrades', 'captured'] as const) {
        if (!sameSet(e[field], g[field])) {
            out.push({ seq, path: `${base}.${field}`, expected: e[field], got: g[field] });
        }
    }
    // Live stats are compared only when the keyframe recorded them: an older file carries
    // none, and "absent" is "not recorded", never "zero".
    if (typeof e.power === 'number' && e.power !== g.power) {
        out.push({ seq, path: `${base}.power`, expected: e.power, got: g.power });
    }
    if (typeof e.hp === 'number' && e.hp !== g.hp) {
        out.push({ seq, path: `${base}.hp`, expected: e.hp, got: g.hp });
    }
    if (Array.isArray(e.keywords) && !sameSet(e.keywords, g.keywords)) {
        out.push({ seq, path: `${base}.keywords`, expected: e.keywords, got: g.keywords });
    }
    return out;
}

function diffSeat(seq: string, seat: 1 | 2, e: PlayerState, g: PlayerState, checkBaseHp: boolean): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    if (checkBaseHp && e.baseHp !== g.baseHp) {
        out.push({ seq, path: `players.${seat}.baseHp`, expected: e.baseHp, got: g.baseHp });
    }
    for (const field of ['handSize', 'resourcesReady', 'resourcesExhausted', 'credits', 'hasForce'] as const) {
        if (e[field] !== g[field]) {
            out.push({ seq, path: `players.${seat}.${field}`, expected: e[field], got: g[field] });
        }
    }
    // Hand and discard CONTENTS. Every MOVE names its card, so both are reconstructable and
    // both are gated (see fold.applyMoveCounts). A hand is unordered, so it compares as a set;
    // a discard pile is ordered (spec §11) and compares in order.
    if (!sameSet(e.hand, g.hand)) {
        out.push({ seq, path: `players.${seat}.hand`, expected: e.hand, got: g.hand });
    }
    if (JSON.stringify(e.discard ?? []) !== JSON.stringify(g.discard ?? [])) {
        out.push({ seq, path: `players.${seat}.discard`, expected: e.discard, got: g.discard });
    }
    // Resource-row MEMBERSHIP, as a set -- the row's order is not part of the model, and the
    // ready/exhausted split is carried by the two counts, not by this list. Compared only when
    // the keyframe carries it, so a file written before `resources` existed still passes.
    if (Array.isArray(e.resources) && !sameSet(e.resources, g.resources)) {
        out.push({ seq, path: `players.${seat}.resources`, expected: e.resources, got: g.resources });
    }
    // A defeated base. Written only when true, so absent on either side reads false.
    if ((e.baseDefeated === true) !== (g.baseDefeated === true)) {
        out.push({ seq, path: `players.${seat}.baseDefeated`, expected: e.baseDefeated === true, got: g.baseDefeated === true });
    }
    // The base's own attachments (Fortify), as a set like a unit's `upgrades`. Compared only
    // when the keyframe carries it, so a file written before `baseUpgrades` existed still passes.
    if (Array.isArray(e.baseUpgrades) && !sameSet(e.baseUpgrades, g.baseUpgrades)) {
        out.push({ seq, path: `players.${seat}.baseUpgrades`, expected: e.baseUpgrades, got: g.baseUpgrades });
    }
    // The base's captives (Arrest), as a set like a unit's `captured`, on the same terms.
    if (Array.isArray(e.baseCaptured) && !sameSet(e.baseCaptured, g.baseCaptured)) {
        out.push({ seq, path: `players.${seat}.baseCaptured`, expected: e.baseCaptured, got: g.baseCaptured });
    }
    // Limited abilities' uses, as a set. Compared only when the keyframe carries them, so a file
    // written before `abilityUses` existed still passes.
    if (Array.isArray(e.abilityUses) && !sameUses(e.abilityUses, g.abilityUses)) {
        out.push({ seq, path: `players.${seat}.abilityUses`, expected: e.abilityUses, got: g.abilityUses });
    }
    // The BASE's Epic Action. Compared only when the keyframe states it -- a base without one
    // carries no flag, and neither does a file written before this existed.
    if (typeof e.baseEpicActionUsed === 'boolean' && e.baseEpicActionUsed !== (g.baseEpicActionUsed ?? false)) {
        out.push({ seq, path: `players.${seat}.baseEpicActionUsed`, expected: e.baseEpicActionUsed, got: g.baseEpicActionUsed ?? false });
    }
    // Like baseHp, the starting deck is not in the stream, so the first keyframe supplies it.
    if (checkBaseHp && typeof e.deckSize === 'number' && e.deckSize !== g.deckSize) {
        out.push({ seq, path: `players.${seat}.deckSize`, expected: e.deckSize, got: g.deckSize });
    }
    // The leader is compared once a keyframe has named it (its id comes from the keyframe or
    // a DEPLOY_LEADER; before either the fold has no leader to be wrong about).
    if (e.leader && g.leader) {
        // `onStartingSide` is only carried for a double-sided leader, so it is compared only
        // when the keyframe states it -- absent means "not a flipping leader", not `false`.
        if (typeof e.leader.onStartingSide === 'boolean' && e.leader.onStartingSide !== g.leader.onStartingSide) {
            out.push({ seq, path: `players.${seat}.leader.onStartingSide`, expected: e.leader.onStartingSide, got: g.leader.onStartingSide });
        }
        for (const field of ['id', 'deployed', 'exhausted', 'epicActionUsed'] as const) {
            if (e.leader[field] !== g.leader[field]) {
                out.push({ seq, path: `players.${seat}.leader.${field}`, expected: e.leader[field], got: g.leader[field] });
            }
        }
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

/**
 * Two effect lists hold the same effects, compared AS A SET BY ID (start order is not part of the
 * model): each id with the same `src`, `p`, `seat`, `duration` and targets as a set. A missing
 * list is an empty one.
 */
function sameEffects(a: unknown, b: unknown): boolean {
    const norm = (x: unknown) => (Array.isArray(x) ? (x as Partial<ActiveEffect>[]) : [])
        .map((fx) => [String(fx?.id), fx?.src, fx?.p, Array.isArray(fx?.targets) ? [...fx.targets].map(String).sort() : null, fx?.seat ?? null, fx?.duration])
        .sort(([i1], [i2]) => (String(i1) < String(i2) ? -1 : String(i1) > String(i2) ? 1 : 0));
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/**
 * Two `abilityUses` lists hold the same uses, compared AS A SET keyed by card and ability (first-use
 * order is not part of the model): each with the same `count` and `per`. An entry whose `per` this
 * reader does not know (a newer minor version, §18) is left out on both sides: the fold cannot
 * reset it, so it cannot be held to it. A missing list is an empty one.
 */
function sameUses(a: unknown, b: unknown): boolean {
    const known = new Set(['phase', 'round', 'game']);
    const norm = (x: unknown) => (Array.isArray(x) ? (x as Partial<AbilityUse>[]) : [])
        .filter((u) => known.has(String(u?.per)))
        .map((u) => [String(u?.card), String(u?.ability), u?.count, u?.per])
        .sort((x, y) => {
            const kx = JSON.stringify(x.slice(0, 2));
            const ky = JSON.stringify(y.slice(0, 2));
            return kx < ky ? -1 : kx > ky ? 1 : 0;
        });
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
}

/** Compares the gated set of fold-tracked invariants against each keyframe (see above). */
function diff(seq: string, expected: ReducedState, got: ReducedState, checkBaseHp: boolean): KeyframeMismatch[] {
    const out: KeyframeMismatch[] = [];
    if (typeof expected.initiativeTaken === 'boolean' && expected.initiativeTaken !== (got.initiativeTaken ?? false)) {
        out.push({ seq, path: 'initiativeTaken', expected: expected.initiativeTaken, got: got.initiativeTaken ?? false });
    }
    // Lasting and delayed effects, as a set by id. Compared only when the keyframe carries them,
    // so a file written before `effects` existed still passes.
    if (Array.isArray(expected.effects) && !sameEffects(expected.effects, got.effects)) {
        out.push({ seq, path: 'effects', expected: expected.effects, got: got.effects });
    }
    // `active` is deliberately NOT compared. It is stated, not reconstructed: ROUND_START,
    // PHASE_START and keyframes carry it, and deriving it from the actions in between would mean
    // modelling passing and priority -- the rules knowledge this format exists to spare a reader.
    // Comparing the fold against the keyframe would only restate that. See spec §11 and §14.
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
            // A ROUND_START keyframe describes a round that has begun: the initiative counter is
            // available again, whatever last round did with it, and the limited abilities' per-phase
            // and per-round uses are spent (the ROUND_START rule the snap skips would have reset both).
            if (e.t === 'ROUND_START') {
                s.initiativeTaken = false;
                // Likewise the per-phase and per-round uses of limited abilities.
                clearAbilityUses(s, ['phase', 'round']);
            }
            mismatches.push(...diff(e.seq, e.keyframe, s, seenKeyframe));
            seenKeyframe = true;
            s = snapTo(e.keyframe);
            continue;
        }
        s = reduce(s, e);
    }
    return { ok: mismatches.length === 0, mismatches };
}
