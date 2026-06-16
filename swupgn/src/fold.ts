import type { GameEvent, ReducedState, PlayerState, CardInstanceState, Seat } from './types';

function emptyPlayer(seat: Seat): PlayerState {
    return {
        seat, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [],
        resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false,
        discard: [], cards: [],
    };
}

function emptyState(): ReducedState {
    return { round: 0, phase: 'setup', initiative: null, players: { 1: emptyPlayer(1), 2: emptyPlayer(2) } };
}

function player(s: ReducedState, seat: Seat): PlayerState {
    if (!s.players[seat]) {
        s.players[seat] = emptyPlayer(seat);
    }
    return s.players[seat]!;
}

/** Resolve a target ref like "base@2" or "SOR#095:2" to the owning seat (best-effort). */
function seatOfBaseRef(ref: string): Seat | null {
    const m = /^base@(\d)$/.exec(ref);
    return m ? (Number(m[1]) as Seat) : null;
}

function findCard(s: ReducedState, id: string): CardInstanceState | undefined {
    for (const seat of [1, 2] as Seat[]) {
        const c = s.players[seat]?.cards.find((x) => x.id === id);
        if (c) {
            return c;
        }
    }
    return undefined;
}

function newCard(id: string, zone: string): CardInstanceState {
    return { id, zone, damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {} };
}

/** Apply a single event to state, mutating and returning it. */
export function reduce(s: ReducedState, e: GameEvent): ReducedState {
    switch (e.t) {
        case 'ROUND_START': s.round = e.round; break;
        case 'PHASE_START': s.phase = (e.phase as ReducedState['phase']); break;
        case 'CLAIM_INITIATIVE': s.initiative = e.p; break;
        // Plan-2: handSize is intentionally NOT decremented on play here; hand tracking
        // is driven by DRAW/RESOURCE/DISCARD deltas. Full play->hand accounting is deferred.
        case 'PLAY': case 'PLAY_SMUGGLE':
            player(s, e.p).cards.push(newCard(e.card, e.zone ?? 'ground')); break;
        case 'PLAY_EVENT':
            player(s, e.p).discard.push(e.card); break;
        case 'PLAY_UPGRADE': {
            if (e.target) {
                const host = findCard(s, e.target);
                if (host) { host.upgrades.push(e.card); break; }
            }
            // Fallback when the host is unknown: track the upgrade as its own instance.
            player(s, e.p).cards.push(newCard(e.card, e.zone ?? 'ground'));
            break;
        }
        case 'DEPLOY_LEADER':
            player(s, e.p).cards.push(newCard(e.card, e.zone ?? 'ground')); break;
        case 'CREATE_TOKEN':
            player(s, e.p).cards.push(newCard(e.token, e.zone)); break;
        case 'DAMAGE': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                player(s, baseSeat).baseHp = e.hp;
            } else {
                const c = findCard(s, e.tgt);
                if (c) {
                    c.damage = Math.max(0, c.damage + e.amt);
                }
            }
            break;
        }
        case 'OVERWHELM': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                player(s, baseSeat).baseHp = e.hp;
            }
            break;
        }
        case 'HEAL': {
            const baseSeat = seatOfBaseRef(e.tgt);
            if (baseSeat) {
                player(s, baseSeat).baseHp = e.hp;
            } else {
                const c = findCard(s, e.tgt);
                if (c) {
                    c.damage = Math.max(0, c.damage - e.amt);
                }
            }
            break;
        }
        case 'DEFEAT': {
            for (const seat of [1, 2] as Seat[]) {
                const ps = s.players[seat];
                if (!ps) {
                    continue;
                }
                const idx = ps.cards.findIndex((c) => c.id === e.card);
                if (idx >= 0) {
                    ps.discard.push(ps.cards[idx].id);
                    ps.cards.splice(idx, 1);
                }
            }
            break;
        }
        case 'EXHAUST': { const c = findCard(s, e.card); if (c) { c.exhausted = true; } break; }
        case 'READY': { const c = findCard(s, e.card); if (c) { c.exhausted = false; } break; }
        case 'MOVE': { const c = findCard(s, e.card); if (c) { c.zone = e.to; } break; }
        case 'DRAW': { const ps = player(s, e.p); ps.handSize += e.count; ps.hand.push(...e.cards); break; }
        case 'DISCARD': {
            const ps = player(s, e.p); ps.handSize = Math.max(0, ps.handSize - e.cards.length);
            ps.discard.push(...e.cards); break;
        }
        case 'RESOURCE': { const ps = player(s, e.p); ps.handSize = Math.max(0, ps.handSize - 1); ps.resourcesReady += 1; break; }
        case 'SHIELD_GAIN': { const c = findCard(s, e.card); if (c) { c.shields += e.count ?? 1; } break; }
        case 'SHIELD_USE': { const c = findCard(s, e.card); if (c) { c.shields = Math.max(0, c.shields - (e.count ?? 1)); } break; }
        case 'EXPERIENCE_GAIN': { const c = findCard(s, e.card); if (c) { c.experience += e.count; } break; }
        case 'STATUS_TOKEN': { const c = findCard(s, e.card); if (c) { c.statusTokens[e.token] = (c.statusTokens[e.token] ?? 0) + e.count; } break; }
        // Pure-log events with no state delta:
        case 'ATTACK': case 'PASS': case 'CHOICE': case 'MULLIGAN':
        case 'KEEP_HAND': case 'MODAL_CHOICE': case 'ABILITY_ACTIVATE': case 'SHUFFLE':
        case 'CAPTURE': case 'RESCUE': case 'TAKE_CONTROL': case 'SEARCH': case 'REVEAL':
        case 'TRIGGER': case 'PHASE_END': case 'ROUND_END': case 'GAME_END':
            break;
        default: { const _exhaustive: never = e; void _exhaustive; break; }
    }
    return s;
}

export function fold(events: GameEvent[]): ReducedState {
    let s = emptyState();
    for (const e of events) {
        // A keyframe is authoritative: snap to it, then continue folding.
        if ((e.t === 'ROUND_START' || e.t === 'ROUND_END') && e.keyframe) {
            s = JSON.parse(JSON.stringify(e.keyframe));
            continue;
        }
        s = reduce(s, e);
    }
    return s;
}

/** Fold up to and including `seq`. */
export function stateAt(events: GameEvent[], seq: string): ReducedState {
    const idx = events.findIndex((e) => e.seq === seq);
    const slice = idx >= 0 ? events.slice(0, idx + 1) : events;
    return fold(slice);
}
