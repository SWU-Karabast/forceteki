import { checkKeyframes } from '../../../swupgn/src/integrity';
import type { CardInstanceState, GameEvent, PlayerState, ReducedState } from '../../../swupgn/src/types';

describe('checkKeyframes', function () {
    it('passes when the fold matches each keyframe', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'X', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: {
                round: 2, phase: 'setup', initiative: null,
                players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                           2: { seat: 2, baseHp: 28, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } },
        ];
        expect(checkKeyframes(events).ok).toBe(true);
    });

    it('fails when an event delta is missing before a keyframe', function () {
        const events: GameEvent[] = [
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: {
                round: 2, phase: 'setup', initiative: null,
                players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                           2: { seat: 2, baseHp: 28, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } },
        ];
        const r = checkKeyframes(events);
        expect(r.ok).toBe(false);
        expect(r.mismatches[0].seq).toBe('R2.start');
    });

    it('fails on a per-card field mismatch (keyframe claims damage but the fold has none)', function () {
        const card = (over: Partial<{ damage: number }>) => ({
            id: 'SOR#232', zone: 'ground', damage: 0, exhausted: false, upgrades: [] as string[],
            shields: 0, experience: 0, statusTokens: {} as Record<string, number>, ...over,
        });
        const seat = (cards: any[]) => ({ seat: 1 as const, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [],
            resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards });
        const seat2 = { seat: 2 as const, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
            resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] };
        const events: GameEvent[] = [
            // Fold produces the card with damage 0 (no DAMAGE event)...
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#232', zone: 'ground' },
            // ...but the keyframe claims damage 2.
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: {
                round: 2, phase: 'setup', initiative: null,
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
        id, zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, ...over,
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
});
