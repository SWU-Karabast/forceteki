import { checkKeyframes } from '../../../swupgn/src/integrity';
import type { CardInstanceState, GameEvent, PlayerState, ReducedState } from '../../../swupgn/src/types';

/** A seat at rest; pass only the fields a test actually cares about. */
function restingSeat(s: 1 | 2, over: Partial<PlayerState> = {}): PlayerState {
    return { seat: s, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
        resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [], ...over };
}

/** A ROUND_START carrying a complete two-seat keyframe. */
function roundStart(round: number, p1: PlayerState, p2: PlayerState): GameEvent {
    return { seq: `R${round}.start`, t: 'ROUND_START', round,
        keyframe: { round, phase: 'setup', initiative: null, players: { 1: p1, 2: p2 } } };
}

describe('checkKeyframes', function () {
    it('passes when the fold matches each keyframe', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'X', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'setup', initiative: null,
                players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                    2: { seat: 2, baseHp: 28, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } },
        ];
        expect(checkKeyframes(events).ok).toBe(true);
    });

    it('fails when an event delta is missing before a keyframe', function () {
        const events: GameEvent[] = [
            // R1 supplies the real starting base HP. baseHp is exempt on the FIRST keyframe
            // only: the stream carries no starting HP, so there is nothing to compare it
            // against until a keyframe provides it.
            roundStart(1, restingSeat(1), restingSeat(2)),
            // R2 claims player 2 took 2 damage, but no DAMAGE event says so.
            roundStart(2, restingSeat(1), restingSeat(2, { baseHp: 28 })),
        ];
        const r = checkKeyframes(events);
        expect(r.ok).toBe(false);
        expect(r.mismatches[0].seq).toBe('R2.start');
        expect(r.mismatches[0].path).toBe('players.2.baseHp');
    });

    it('does not compare baseHp at the first keyframe (starting HP is not in the stream)', function () {
        // Real bases are not the 30 that emptyState() seeds. The first keyframe is what tells
        // the reader the truth, so comparing against the placeholder proves nothing.
        const events: GameEvent[] = [
            roundStart(1, restingSeat(1, { baseHp: 33, baseMaxHp: 33 }), restingSeat(2, { baseHp: 28, baseMaxHp: 28 })),
        ];
        expect(checkKeyframes(events).ok).toBe(true);
    });

    it('still compares every non-baseHp field at the first keyframe', function () {
        const events: GameEvent[] = [
            roundStart(1, restingSeat(1, { baseHp: 33, handSize: 2 }), restingSeat(2, { baseHp: 28 })),
        ];
        const r = checkKeyframes(events);
        expect(r.ok).toBe(false);
        expect(r.mismatches.map((m) => m.path)).toEqual(['players.1.handSize']);
    });

    it('fails on a per-card field mismatch (keyframe claims damage but the fold has none)', function () {
        const card = (over: Partial<{ damage: number }>) => ({
            id: 'SOR#232', zone: 'ground', damage: 0, exhausted: false, upgrades: [] as string[],
            shields: 0, experience: 0, statusTokens: {} as Record<string, number>, captured: [] as string[], ...over,
        });
        const seat = (cards: any[]) => ({ seat: 1 as const, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [],
            resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards });
        const seat2 = { seat: 2 as const, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
            resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] };
        const events: GameEvent[] = [
            // Fold produces the card with damage 0 (no DAMAGE event)...
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#232', zone: 'ground' },
            // ...but the keyframe claims damage 2.
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'setup', initiative: null,
                players: { 1: seat([card({ damage: 2 })]), 2: seat2 } } },
        ];
        const r = checkKeyframes(events);
        expect(r.ok).toBe(false);
        const dmg = r.mismatches.find((m) => m.path === 'players.1.cards[SOR#232].damage');
        expect(dmg).toBeDefined();
        expect(dmg!.expected).toBe(2);
        expect(dmg!.got).toBe(0);
    });
});

// Organic multi-round completeness (Plan-3 close-out of the SwuPgnKeyframeCompleteness R2+ caveat).
//
// The integration harness (GameStateBuilder) tears down the natural opening hand/resources WITHOUT
// emitting MOVEs (a double-setup artifact), so its keyframe gate can't assert handSize/resourcesReady
// past R1. That artifact lives entirely in the test bootstrap, NOT in the event model: given a clean,
// single-setup stream where every zone transition carries its MOVE, the fold reconstructs
// handSize/resourcesReady correctly at EVERY keyframe. This proves it directly — no engine, no
// double-setup — by driving a hand-built three-round stream (draws, resourcing, plays, combat) and
// asserting checkKeyframes passes on the FULL gated set (counts included) at R2.start and R3.start.
describe('checkKeyframes — organic multi-round count reconstruction (no double-setup)', function () {
    const cardState = (id: string, over: Partial<CardInstanceState> = {}): CardInstanceState => ({
        id, zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [], ...over,
    });
    const playerState = (s: 1 | 2, over: Partial<PlayerState> = {}): PlayerState => ({
        seat: s, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0,
        credits: 0, hasForce: false, discard: [], cards: [], ...over,
    });
    const keyframe = (round: number, p1: PlayerState, p2: PlayerState): ReducedState => ({
        round, phase: 'action', initiative: null, players: { 1: p1, 2: p2 },
    });
    const mv = (seq: string, card: string, from: string, to: string, p: 1 | 2): GameEvent =>
        ({ seq, t: 'MOVE', card, from, to, p });

    it('reconstructs handSize/resourcesReady and per-card state at every keyframe across 3 rounds', function () {
        const events: GameEvent[] = [
            // ── R1: clean start (empty board) ──
            { seq: 'R1.start', t: 'ROUND_START', round: 1, keyframe: keyframe(1, playerState(1), playerState(2)) },
            // Opening draws: deck -> hand (handSize 0 -> 6 each).
            ...(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].map((c, i) => mv(`R1.S.${i}`, `P1#${c}`, 'deck', 'hand', 1))),
            ...(['e1', 'e2', 'e3', 'e4', 'e5', 'e6'].map((c, i) => mv(`R1.S.${i + 6}`, `P2#${c}`, 'deck', 'hand', 2))),
            // Resource step: hand -> resource (resourcesReady +2, handSize -2 each).
            mv('R1.S.12', 'P1#d1', 'hand', 'resource', 1),
            mv('R1.S.13', 'P1#d2', 'hand', 'resource', 1),
            mv('R1.S.14', 'P2#e1', 'hand', 'resource', 2),
            mv('R1.S.15', 'P2#e2', 'hand', 'resource', 2),
            // P1 plays a unit (PLAY places it; the paired hand->ground MOVE decrements handSize).
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'P1#unit', zone: 'ground', cost: 2 },
            mv('R1.A.1a', 'P1#unit', 'hand', 'ground', 1),
            // P1 attacks P2's base for 2.
            { seq: 'R1.A.2', t: 'ATTACK', p: 1, atk: 'P1#unit', def: 'base@2', defenderType: 'base' },
            { seq: 'R1.A.2a', t: 'DAMAGE', src: 'P1#unit', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },

            // ── R2: counts must match (handSize P1 3 / P2 4, resourcesReady 2 / 2, P2 base 28) ──
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: keyframe(2,
                playerState(1, { handSize: 3, resourcesReady: 2, cards: [cardState('P1#unit')] }),
                playerState(2, { handSize: 4, resourcesReady: 2, baseHp: 28 })) },
            // P2 plays a unit.
            { seq: 'R2.A.1', t: 'PLAY', p: 2, card: 'P2#unit', zone: 'ground', cost: 2 },
            mv('R2.A.1a', 'P2#unit', 'hand', 'ground', 2),
            // P1 resources one more card (resourcesReady 2 -> 3, handSize 3 -> 2).
            mv('R2.A.2', 'P1#d3', 'hand', 'resource', 1),
            // P2 attacks P1's unit for 3 and exhausts.
            { seq: 'R2.A.3', t: 'ATTACK', p: 2, atk: 'P2#unit', def: 'P1#unit', defenderType: 'unit' },
            { seq: 'R2.A.3a', t: 'DAMAGE', src: 'P2#unit', tgt: 'P1#unit', amt: 3, damageType: 'combat', hp: 0 },
            { seq: 'R2.A.3b', t: 'EXHAUST', card: 'P2#unit' },

            // ── R3: counts AND per-card state must match ──
            { seq: 'R3.start', t: 'ROUND_START', round: 3, keyframe: keyframe(3,
                playerState(1, { handSize: 2, resourcesReady: 3, cards: [cardState('P1#unit', { damage: 3 })] }),
                playerState(2, { handSize: 3, resourcesReady: 2, baseHp: 28, cards: [cardState('P2#unit', { exhausted: true })] })) },
        ];

        const r = checkKeyframes(events);
        // Includes handSize/resourcesReady at R2.start and R3.start — the fields the integration
        // harness must defer. A clean MOVE stream reconstructs them exactly.
        expect(r.mismatches).toEqual([]);
        expect(r.ok).toBe(true);
    });

    it('reports a card the fold tracks in play but the keyframe omits', function () {
        // The symmetric direction of the missing-card check: a DEFEAT/MOVE-out that fails to
        // remove a card leaves the fold holding one the engine no longer reports.
        const events: GameEvent[] = [
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'P1#unit', zone: 'ground', cost: 2 },
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: keyframe(2,
                playerState(1, { cards: [] }),
                playerState(2, {})) },
        ];

        const r = checkKeyframes(events);

        expect(r.ok).toBe(false);
        expect(r.mismatches).toContain(jasmine.objectContaining({
            path: 'players.1.cards[P1#unit]', expected: 'absent', got: 'present',
        }));
    });
});

// The gate grew: resources' ready/exhausted split, credits, the Force, and per-card `upgrades`
// and `captured` are now reconstructable from the stream, so a keyframe that disagrees is a
// writer defect and is reported.
describe('checkKeyframes — the resource, credit, Force and attachment fields', function () {
    const seat = (s: 1 | 2, over: Partial<PlayerState> = {}): PlayerState => ({
        seat: s, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0,
        credits: 0, hasForce: false, discard: [], cards: [], ...over,
    });
    const card = (id: string, over: Partial<CardInstanceState> = {}): CardInstanceState => ({
        id, zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured: [], ...over,
    });
    const kf = (seq: string, p1: PlayerState, p2: PlayerState): GameEvent => ({
        seq, t: 'ROUND_END', round: 1, keyframe: { round: 1, phase: 'regroup', initiative: null, players: { 1: p1, 2: p2 } },
    });

    it('passes when EXHAUST_RESOURCES, a Credit token and an attachment are all accounted for', function () {
        const events: GameEvent[] = [
            { seq: 'R0.S.1', t: 'MOVE', card: 'A', from: 'hand', to: 'resource', p: 1 },
            { seq: 'R0.S.2', t: 'MOVE', card: 'B', from: 'hand', to: 'resource', p: 1 },
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.0b', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
            { seq: 'R1.A.1a', t: 'MOVE', card: 'LOF#215', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'SOR#095' },
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', target: 'SOR#095' },
            { seq: 'R1.A.3a', t: 'MOVE', card: 'TOKEN:credit#8015500527', from: 'outsideTheGame', to: 'base', p: 2 },
            kf('R1.end',
                seat(1, { resourcesReady: 0, resourcesExhausted: 2, cards: [card('SOR#095', { upgrades: ['LOF#215'] })] }),
                seat(2, { credits: 1 })),
        ];
        expect(checkKeyframes(events).mismatches).toEqual([]);
    });

    it('reports each of the new fields when the stream under-records it', function () {
        const events: GameEvent[] = [
            kf('R1.start', seat(1), seat(2)),
            { seq: 'R2.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R2.A.0b', t: 'MOVE', card: 'SOR#095:2', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
            kf('R2.end',
                seat(1, { resourcesExhausted: 1, hasForce: true, cards: [card('SOR#095', { upgrades: ['LOF#215'], captured: ['SOR#095:2'] })] }),
                seat(2, { credits: 1, cards: [card('SOR#095:2')] })),
        ];
        expect(checkKeyframes(events).mismatches.map((m) => m.path).sort()).toEqual([
            'players.1.cards[SOR#095].captured',
            'players.1.cards[SOR#095].upgrades',
            'players.1.hasForce',
            'players.1.resourcesExhausted',
            'players.2.credits',
        ]);
    });

    it('compares upgrades and captured as sets, and treats a missing list as empty', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.1', t: 'PLAY_UPGRADE', p: 1, card: 'B', target: 'SOR#095' },
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'A', target: 'SOR#095' },
            // Attachment order differs, and an older writer's card carries no `captured` at all.
            kf('R1.end', seat(1, { cards: [{ ...card('SOR#095', { upgrades: ['A', 'B'] }), captured: undefined as unknown as string[] }] }), seat(2)),
        ];
        expect(checkKeyframes(events).mismatches).toEqual([]);
    });

    it('does not compare power/hp: they are snapshot fields, not folded ones', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            kf('R1.end', seat(1, { cards: [card('SOR#095', { power: 5, hp: 3 })] }), seat(2)),
        ];
        expect(checkKeyframes(events).mismatches).toEqual([]);
    });
});
