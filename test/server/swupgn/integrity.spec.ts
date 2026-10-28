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

    // Value: protects=a keyframe whose status tokens list the same names in another order still verifies (§14); fails_when=the token maps are compared as JSON text again; why_new=no test put two token names in different orders; seam=none; no_claim=none beyond protects
    it('compares status tokens without regard to key order', function () {
        const card = (statusTokens: Record<string, number>): CardInstanceState => ({ id: 'SOR#108', zone: 'ground', damage: 0,
            exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens, captured: [] });
        const events: GameEvent[] = [
            { seq: 'R1.A.0', t: 'MOVE', card: 'SOR#108', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.1', t: 'STATUS_TOKEN', card: 'SOR#108', token: 'advantage', count: 1 },
            { seq: 'R1.A.2', t: 'STATUS_TOKEN', card: 'SOR#108', token: 'weakness', count: 1 },
            roundStart(2, restingSeat(1, { cards: [card({ weakness: 1, advantage: 1 })] }), restingSeat(2)),
        ];
        expect(checkKeyframes(events).mismatches).toEqual([]);
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
        const card = (over: Partial<{ damage: number }>) => {
            const upgrades: string[] = [];
            const statusTokens: Record<string, number> = {};
            const captured: string[] = [];
            return {
                id: 'SOR#232', zone: 'ground', damage: 0, exhausted: false, upgrades,
                shields: 0, experience: 0, statusTokens, captured, ...over,
            };
        };
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
        expect(dmg.expected).toBe(2);
        expect(dmg.got).toBe(0);
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
            // Opening draws: deck -> hand (handSize 0 -> 7 each). Each seat draws the unit it
            // later plays: a card can only leave a hand it was in, and now that `hand` CONTENTS
            // are gated the stream has to be coherent, not just arithmetically right.
            ...(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'unit'].map((c, i) => mv(`R1.S.${i}`, `P1#${c}`, 'deck', 'hand', 1))),
            ...(['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'unit'].map((c, i) => mv(`R1.S.${i + 7}`, `P2#${c}`, 'deck', 'hand', 2))),
            // Resource step: hand -> resource (resourcesReady +2, handSize -2 each).
            mv('R1.S.14', 'P1#d1', 'hand', 'resource', 1),
            mv('R1.S.15', 'P1#d2', 'hand', 'resource', 1),
            mv('R1.S.16', 'P2#e1', 'hand', 'resource', 2),
            mv('R1.S.17', 'P2#e2', 'hand', 'resource', 2),
            // P1 plays a unit (PLAY places it; the paired hand->ground MOVE decrements handSize).
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'P1#unit', zone: 'ground', cost: 2 },
            mv('R1.A.1a', 'P1#unit', 'hand', 'ground', 1),
            // P1 attacks P2's base for 2.
            { seq: 'R1.A.2', t: 'ATTACK', p: 1, atk: 'P1#unit', def: 'base@2', defenderType: 'base' },
            { seq: 'R1.A.2a', t: 'DAMAGE', src: 'P1#unit', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 },

            // ── R2: counts AND hand contents must match (P1 4 / P2 5, resourcesReady 2 / 2, P2 base 28) ──
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: keyframe(2,
                playerState(1, { handSize: 4, resourcesReady: 2, hand: ['P1#d3', 'P1#d4', 'P1#d5', 'P1#d6'],
                    cards: [cardState('P1#unit')] }),
                playerState(2, { handSize: 5, resourcesReady: 2, baseHp: 28,
                    hand: ['P2#e3', 'P2#e4', 'P2#e5', 'P2#e6', 'P2#unit'] })) },
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
                playerState(1, { handSize: 3, resourcesReady: 3, hand: ['P1#d4', 'P1#d5', 'P1#d6'],
                    cards: [cardState('P1#unit', { damage: 3 })] }),
                playerState(2, { handSize: 4, resourcesReady: 2, baseHp: 28,
                    hand: ['P2#e3', 'P2#e4', 'P2#e5', 'P2#e6'],
                    cards: [cardState('P2#unit', { exhausted: true })] })) },
        ];

        const r = checkKeyframes(events);
        // Includes handSize/resourcesReady AND hand contents at R2.start and R3.start — the
        // fields the integration harness must defer. A clean MOVE stream reconstructs them exactly.
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

    it('compares power/hp/keywords once STATS has stated them, and skips them when the keyframe has none', function () {
        const enter: GameEvent = { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' };
        const stats: GameEvent = { seq: 'R1.A.0b', t: 'STATS', card: 'SOR#095', power: 5, hp: 3, keywords: ['raid 2', 'sentinel'] };
        // Agreement.
        expect(checkKeyframes([enter, stats, kf('R1.end', seat(1, { cards: [card('SOR#095', { power: 5, hp: 3, keywords: ['sentinel', 'raid 2'] })] }), seat(2))]).mismatches).toEqual([]);
        // The stream never said: reported, because the keyframe did.
        expect(checkKeyframes([enter, kf('R1.end', seat(1, { cards: [card('SOR#095', { power: 5, hp: 3 })] }), seat(2))]).mismatches.map((m) => m.path))
            .toEqual(['players.1.cards[SOR#095].power', 'players.1.cards[SOR#095].hp']);
        // An older keyframe with no stats has nothing to compare.
        expect(checkKeyframes([enter, stats, kf('R1.end', seat(1, { cards: [card('SOR#095')] }), seat(2))]).mismatches).toEqual([]);
    });

    it('gates the leader, the deck count (first keyframe exempt) and the initiative status', function () {
        const leader = (over = {}) => ({ id: 'SOR#010', deployed: false, exhausted: false, epicActionUsed: false, ...over });
        const events: GameEvent[] = [
            { seq: 'R1.start', t: 'ROUND_START', round: 1, keyframe: { round: 1, phase: 'action', initiative: 1, initiativeTaken: false, players: { 1: seat(1, { deckSize: 40, leader: leader() }), 2: seat(2, { deckSize: 40, leader: leader({ id: 'SOR#005' }) }) } } },
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'SOR#010', zone: 'ground', epic: true },
            { seq: 'R1.A.1a', t: 'MOVE', card: 'SOR#010', from: 'base', to: 'ground', p: 1 },
            { seq: 'R1.A.2', t: 'CLAIM_INITIATIVE', p: 2 },
            { seq: 'R1.A.2a', t: 'EXHAUST', card: 'SOR#005' },
            { seq: 'R1.G.1', t: 'MOVE', card: 'X', from: 'deck', to: 'hand', p: 1 },
            { seq: 'R1.end', t: 'ROUND_END', round: 1, keyframe: { round: 1, phase: 'regroup', initiative: 2, initiativeTaken: true, players: { 1: seat(1, { handSize: 1, hand: ['X'], deckSize: 39, leader: leader({ deployed: true, epicActionUsed: true }), cards: [card('SOR#010')] }),
                2: seat(2, { deckSize: 40, leader: leader({ id: 'SOR#005', exhausted: true }) }) } } },
            // Round 2 opens: the counter is available again, and the deck count is now compared.
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 2, initiativeTaken: false, players: { 1: seat(1, { handSize: 1, hand: ['X'], deckSize: 39, leader: leader({ deployed: true, epicActionUsed: true }), cards: [card('SOR#010')] }),
                2: seat(2, { deckSize: 40, leader: leader({ id: 'SOR#005', exhausted: true }) }) } } },
        ];
        expect(checkKeyframes(events).mismatches).toEqual([]);
        // ...and each is reported when wrong.
        const wrong = JSON.parse(JSON.stringify(events)) as any[];
        wrong[6].keyframe.initiativeTaken = false;
        wrong[6].keyframe.players[1].deckSize = 38;
        wrong[6].keyframe.players[1].leader.epicActionUsed = false;
        wrong[6].keyframe.players[2].leader.exhausted = false;
        expect(checkKeyframes(wrong).mismatches.filter((m) => m.seq === 'R1.end').map((m) => m.path)
            .sort()).toEqual([
            'initiativeTaken', 'players.1.deckSize', 'players.1.leader.epicActionUsed', 'players.2.leader.exhausted',
        ]);
    });

    // Value: protects=gate on baseDefeated (absent==false) and baseUpgrades (set, only when stated); fails_when=either field ungated, absent!=false, or order-sensitive; why_new=vectors only prove the agreeing case; seam=none; no_claim=writer output
    it('gates baseDefeated (absent reads false) and baseUpgrades (as a set, only when the keyframe states it)', function () {
        const fortify = (card: string, seq: string): GameEvent => ({ seq, t: 'MOVE', card, from: 'hand', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' });
        const fortified = [fortify('HMW#271', 'R1.A.1a'), fortify('HMW#147', 'R1.A.2a')];
        const defeat: GameEvent = { seq: 'R1.A.3a', t: 'DEFEAT', card: 'base@2', reason: 'ability' };
        const paths = (events: GameEvent[]) => checkKeyframes(events).mismatches.map((m) => m.path).sort();

        // Agreement: order differs, and seat 2 says baseDefeated while the fold set it.
        expect(paths([...fortified, defeat, kf('R1.end', seat(1, { baseUpgrades: ['HMW#147', 'HMW#271'] }), seat(2, { baseDefeated: true }))])).toEqual([]);
        // An older keyframe with no baseUpgrades has nothing to compare; absent baseDefeated equals false.
        expect(paths([...fortified, kf('R1.end', seat(1), seat(2))])).toEqual([]);
        expect(paths([kf('R1.end', seat(1, { baseDefeated: false } as any), seat(2))])).toEqual([]);
        // Disagreement either way round is reported.
        expect(paths([...fortified, kf('R1.end', seat(1, { baseUpgrades: ['HMW#271'] }), seat(2, { baseDefeated: true }))]))
            .toEqual(['players.1.baseUpgrades', 'players.2.baseDefeated']);
        expect(paths([defeat, kf('R1.end', seat(1), seat(2))])).toEqual(['players.2.baseDefeated']);
    });

    // Value: protects=gate on baseCaptured (set, only when stated) and its release on leaving capture; fails_when=field ungated, order-sensitive, or a rescued captive stays on the base; why_new=vectors only prove the agreeing case; seam=none; no_claim=writer output
    it('gates baseCaptured as a set, only when the keyframe states it, and a rescue empties it', function () {
        const arrest = (card: string, seq: string): GameEvent => ({ seq, t: 'CAPTURE', p: 1, card, by: 'base@1' });
        const arrested = [arrest('SEC#253', 'R1.A.1a'), arrest('SOR#095', 'R1.A.2a')];
        const rescue: GameEvent = { seq: 'R1.regroup.1a', t: 'MOVE', card: 'SEC#253', from: 'capture', to: 'discard', p: 2 };
        const paths = (events: GameEvent[]) => checkKeyframes(events).mismatches.map((m) => m.path).sort();

        expect(paths([...arrested, kf('R1.end', seat(1, { baseCaptured: ['SOR#095', 'SEC#253'] }), seat(2))])).toEqual([]);
        // An older keyframe with no baseCaptured has nothing to compare.
        expect(paths([...arrested, kf('R1.end', seat(1), seat(2))])).toEqual([]);
        expect(paths([...arrested, kf('R1.end', seat(1, { baseCaptured: ['SEC#253'] }), seat(2))])).toEqual(['players.1.baseCaptured']);
        expect(paths([...arrested, rescue, kf('R1.end', seat(1, { baseCaptured: ['SOR#095'] }), seat(2, { discard: ['SEC#253'] }))])).toEqual([]);
    });
});

describe('checkKeyframes effects', function () {
    const effect = (id: string, targets: string[]) => ({ id, src: 'SOR#142', p: 1 as const, targets, duration: 'phase' as const });
    const starts: GameEvent[] = [
        { seq: 'R1.A.1a', t: 'EFFECT_START', id: 'fx@1', src: 'SOR#142', p: 1, targets: ['A', 'B'], duration: 'phase' },
        { seq: 'R1.A.2a', t: 'EFFECT_START', id: 'fx@2', src: 'SOR#142', p: 1, targets: ['C'], duration: 'phase' },
    ];
    const kf = (effects?: ReturnType<typeof effect>[]): GameEvent => ({ seq: 'R1.end', t: 'ROUND_END', round: 1,
        keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: restingSeat(1), 2: restingSeat(2) }, ...(effects ? { effects } : {}) } });
    const paths = (events: GameEvent[]) => checkKeyframes(events).mismatches.map((m) => m.path);

    // Value: protects=the gate compares effects by id as a set, targets as a set; fails_when=effects ungated or compared in order; why_new=effects are new; seam=none; no_claim=writer output
    it('compares effects by id as a set', function () {
        expect(paths([...starts, kf([effect('fx@2', ['C']), effect('fx@1', ['B', 'A'])])])).toEqual([]);
        expect(paths([...starts, kf([effect('fx@1', ['A', 'B'])])])).toEqual(['effects']);
        expect(paths([...starts, kf([effect('fx@1', ['A']), effect('fx@2', ['C'])])])).toEqual(['effects']);
    });

    // Value: protects=a keyframe written before effects existed still verifies; fails_when=an absent effects list reads as empty; why_new=effects are new; seam=none; no_claim=none
    it('does not compare effects when the keyframe has none', function () {
        expect(paths([...starts, kf()])).toEqual([]);
    });
});

describe('checkKeyframes abilityUses', function () {
    const use = (seq: string, per: 'phase' | 'round' | 'game', card = 'SOR#045'): GameEvent =>
        ({ seq, t: 'ABILITY_ACTIVATE', p: 1, card, ability: 'a1', kind: 'triggered', limit: { max: 2, per } });
    const entry = (card: string, count: number, per: 'phase' | 'round' | 'game') => ({ card, ability: 'a1', count, per });
    const kf = (t: 'ROUND_START' | 'ROUND_END', abilityUses?: ReturnType<typeof entry>[]): GameEvent => ({ seq: t === 'ROUND_END' ? 'R1.end' : 'R2.start', t, round: t === 'ROUND_END' ? 1 : 2, active: 1,
        keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: restingSeat(1, abilityUses ? { abilityUses } : {}), 2: restingSeat(2) } } });
    const paths = (events: GameEvent[]) => checkKeyframes(events).mismatches.map((m) => m.path);

    // Value: protects=the gate compares each seat's abilityUses as a set when the keyframe carries it; fails_when=abilityUses ungated, compared in order, or compared when absent; why_new=abilityUses are new; seam=none; no_claim=writer output
    it('compares abilityUses when the keyframe carries it', function () {
        const events = [use('R1.A.1', 'phase'), use('R1.A.2', 'phase'), use('R1.A.3', 'game', 'SOR#046')];
        expect(paths([...events, kf('ROUND_END', [entry('SOR#046', 1, 'game'), entry('SOR#045', 2, 'phase')])])).toEqual([]);
        expect(paths([...events, kf('ROUND_END', [entry('SOR#045', 1, 'phase'), entry('SOR#046', 1, 'game')])])).toEqual(['players.1.abilityUses']);
        expect(paths([...events, kf('ROUND_END', [entry('SOR#045', 2, 'phase')])])).toEqual(['players.1.abilityUses']);
        expect(paths([...events, kf('ROUND_END')])).toEqual([]);
    });

    // Value: protects=a ROUND_START keyframe describes a round that has begun, so the per-phase and per-round uses the snap skips clearing are cleared before the compare; fails_when=a correct ROUND_START keyframe reports last round's uses as a mismatch; why_new=abilityUses are new; seam=none; no_claim=none
    it('clears per-phase and per-round uses before comparing a ROUND_START keyframe', function () {
        const events = [use('R1.A.1', 'phase'), use('R1.A.2', 'round', 'SOR#046'), use('R1.A.3', 'game', 'SOR#047')];
        expect(paths([...events, kf('ROUND_START', [entry('SOR#047', 1, 'game')])])).toEqual([]);
    });
});
