import { fold, stateAt } from '../../../swupgn/src/fold';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import type { GameEvent } from '../../../swupgn/src/types';
import { parse } from '../../../swupgn/src/parse';
import * as fs from 'fs';
import * as path from 'path';

function ev(e: GameEvent): GameEvent {
    return e;
}

describe('fold', function () {
    const events: GameEvent[] = [
        ev({ seq: 'R1.A.start', t: 'PHASE_START', phase: 'action' }),
        ev({ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground', cost: 2 }),
        ev({ seq: 'R1.A.2', t: 'ATTACK', p: 1, atk: 'SOR#108', def: 'base', defenderType: 'base' }),
        ev({ seq: 'R1.A.2a', t: 'DAMAGE', src: 'SOR#108', tgt: 'base@2', amt: 2, damageType: 'combat', hp: 28 }),
        ev({ seq: 'R1.A.2b', t: 'EXHAUST', card: 'SOR#108' }),
    ];

    it('places a played card into its zone', function () {
        const s = fold(events.slice(0, 2));
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')?.zone).toBe('ground');
    });

    it('applies damage to a base via remaining hp delta', function () {
        const s = fold(events);
        expect(s.players[2]?.baseHp).toBe(28);
    });

    it('marks the attacker exhausted', function () {
        const s = fold(events);
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')?.exhausted).toBe(true);
    });

    it('stateAt stops at the given seq (exclusive of later events)', function () {
        const s = stateAt(events, 'R1.A.1');
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')?.exhausted).toBe(false);
    });
});

describe('fold additional events', function () {
    it('PLAY_EVENT goes to discard, not into play', function () {
        const s = fold([{ seq: 'R1.A.1', t: 'PLAY_EVENT', p: 1, card: 'SOR#142' }] as any);
        expect(s.players[1]?.cards.length).toBe(0);
        expect(s.players[1]?.discard).toContain('SOR#142');
    });

    it('PLAY_UPGRADE attaches to its host unit', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'SOR#200', target: 'SOR#108' },
        ] as any);
        expect(s.players[1]?.cards.length).toBe(1);
        expect(s.players[1]?.cards[0].upgrades).toContain('SOR#200');
    });

    it('DEFEAT moves a card from play to discard', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 2, card: 'SOR#045', zone: 'ground' },
            { seq: 'R1.A.2', t: 'DEFEAT', card: 'SOR#045', reason: 'no_remaining_hp' },
        ] as any);
        expect(s.players[2]?.cards.length).toBe(0);
        expect(s.players[2]?.discard).toContain('SOR#045');
    });

    it('DRAW records the known hand contents (handSize is driven by MOVE, the engine source of truth)', function () {
        const s = fold([{ seq: 'R1.S.1', t: 'DRAW', p: 1, count: 2, cards: ['SOR#108', 'SOR#142'] }] as any);
        // DRAW no longer mutates handSize: in real streams every drawn card also produces a
        // deck->hand MOVE, and counting both would double-count vs the keyframe.
        expect(s.players[1]?.handSize).toBe(0);
        expect(s.players[1]?.hand).toEqual(['SOR#108', 'SOR#142']);
    });

    it('stateAt with a nonexistent seq folds the whole log', function () {
        const events = [{ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' }] as any;
        const s = stateAt(events, 'R9.Z.9');
        expect(s.players[1]?.cards.length).toBe(1);
    });
});

describe('fold keyframes', function () {
    it('snaps to a keyframe state and continues folding', function () {
        const kf = { round: 2, phase: 'action' as const, initiative: 1 as const, players: {
            1: { seat: 1 as const, baseHp: 25, baseMaxHp: 30, handSize: 3, hand: [], resourcesReady: 4, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
            2: { seat: 2 as const, baseHp: 18, baseMaxHp: 30, handSize: 2, hand: [], resourcesReady: 4, resourcesExhausted: 0, credits: 0, hasForce: true, discard: [], cards: [] },
        } };
        const events = [
            { seq: 'R2.start', t: 'ROUND_START' as const, round: 2, keyframe: kf },
            { seq: 'R2.A.1a', t: 'DAMAGE' as const, src: 'X', tgt: 'base@2', amt: 3, damageType: 'combat', hp: 15 },
        ];
        const s = fold(events as any);
        expect(s.players[1]?.baseHp).toBe(25);
        expect(s.players[2]?.baseHp).toBe(15);
    });
});

describe('fold event coverage', function () {
    it('MOVE drives handSize and resourcesReady (deck->hand, then hand->resource)', function () {
        const s = fold([
            { seq: 'R1.S.1', t: 'MOVE', p: 1, card: 'SOR#142', from: 'deck', to: 'hand' },
            { seq: 'R1.S.2', t: 'MOVE', p: 1, card: 'SOR#108', from: 'deck', to: 'hand' },
            { seq: 'R1.S.3', t: 'MOVE', p: 1, card: 'SOR#142', from: 'hand', to: 'resource' },
        ] as any);
        expect(s.players[1]?.handSize).toBe(1);
        expect(s.players[1]?.resourcesReady).toBe(1);
    });

    it('MOVE places an arena card on entry and removes it on exit (idempotent by id)', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'MOVE', p: 2, card: 'SOR#095', from: 'outsideTheGame', to: 'ground' },
            // A redundant MOVE for an already-tracked card must not duplicate it.
            { seq: 'R1.A.2', t: 'MOVE', p: 2, card: 'SOR#095', from: 'ground', to: 'ground' },
        ] as any);
        expect(s.players[2]?.cards.filter((c) => c.id === 'SOR#095').length).toBe(1);
        const s2 = fold([
            { seq: 'R1.A.1', t: 'MOVE', p: 2, card: 'SOR#095', from: 'outsideTheGame', to: 'ground' },
            { seq: 'R1.A.2', t: 'MOVE', p: 2, card: 'SOR#095', from: 'ground', to: 'discard' },
        ] as any);
        expect(s2.players[2]?.cards.find((c) => c.id === 'SOR#095')).toBeUndefined();
    });

    it('PLAY then a coinciding hand->ground MOVE does not double-add the card', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.1a', t: 'MOVE', p: 1, card: 'SOR#108', from: 'hand', to: 'ground' },
        ] as any);
        expect(s.players[1]?.cards.filter((c) => c.id === 'SOR#108').length).toBe(1);
    });

    it('DEPLOY_LEADER and CREATE_TOKEN add cards to play', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'SOR#010', zone: 'ground' },
            { seq: 'R1.A.2', t: 'CREATE_TOKEN', p: 2, token: 'TOKEN:X-Wing', zone: 'space' },
        ] as any);
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#010')?.zone).toBe('ground');
        expect(s.players[2]?.cards.find((c) => c.id === 'TOKEN:X-Wing')?.zone).toBe('space');
    });

    it('OVERWHELM sets the defender base hp', function () {
        const s = fold([{ seq: 'R1.A.1b', t: 'OVERWHELM', p: 1, tgt: 'base@2', amt: 4, hp: 16 }] as any);
        expect(s.players[2]?.baseHp).toBe(16);
    });

    it('HEAL on a card reduces damage; MOVE changes zone; shields/experience/status accrue', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2a', t: 'DAMAGE', src: 'X', tgt: 'SOR#108', amt: 3, damageType: 'combat', hp: 0 },
            { seq: 'R1.A.2b', t: 'HEAL', tgt: 'SOR#108', amt: 1, hp: 0 },
            { seq: 'R1.A.3', t: 'MOVE', card: 'SOR#108', from: 'ground', to: 'space' },
            { seq: 'R1.A.4', t: 'SHIELD_GAIN', card: 'SOR#108', count: 1 },
            { seq: 'R1.A.5', t: 'EXPERIENCE_GAIN', card: 'SOR#108', count: 2 },
            { seq: 'R1.A.6', t: 'STATUS_TOKEN', card: 'SOR#108', token: 'stun', count: 1 },
        ] as any);
        const c = s.players[1]?.cards.find((x) => x.id === 'SOR#108');
        expect(c.damage).toBe(2);
        expect(c.zone).toBe('space');
        expect(c.shields).toBe(1);
        expect(c.experience).toBe(2);
        expect(c.statusTokens.stun).toBe(1);
    });

    // Value: protects=fold() itself never makes a reserved name a statusTokens key (§23), for events that did not come through parse(); fails_when=the fold's guard is dropped; why_new=only parse() refused reserved token names; seam=none; no_claim=none beyond protects
    it('skips a STATUS_TOKEN whose token is a reserved name', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'STATUS_TOKEN', card: 'SOR#108', token: 'hasOwnProperty', count: 1 },
            { seq: 'R1.A.3', t: 'STATUS_TOKEN', card: 'SOR#108', token: 'advantage', count: 1 },
        ] as any);
        const c = s.players[1]?.cards.find((x) => x.id === 'SOR#108');
        expect(Object.keys(c.statusTokens)).toEqual(['advantage']);
        expect(() => String(c.statusTokens)).not.toThrow();
    });
});

describe('fold event coverage — regression gaps', function () {
    it('a unit token folds to a SINGLE arena card across CREATE_TOKEN, DAMAGE, EXHAUST (consistent id)', function () {
        // Regression: the recorder once emitted CREATE_TOKEN with the bare display title while every
        // later token event used the stable TOKEN:<name> id, producing a phantom card plus an orphaned
        // damaged/exhausted instance. With consistent ids it must be exactly one card carrying both.
        const s = fold([
            { seq: 'R1.A.1', t: 'CREATE_TOKEN', p: 1, token: 'TOKEN:Clone', zone: 'ground' },
            { seq: 'R1.A.1a', t: 'DAMAGE', src: 'X', tgt: 'TOKEN:Clone', amt: 2, damageType: 'combat', hp: 0 },
            { seq: 'R1.A.1b', t: 'EXHAUST', card: 'TOKEN:Clone' },
        ] as any);
        const clones = s.players[1]?.cards.filter((c) => c.id === 'TOKEN:Clone');
        expect(clones.length).toBe(1);
        expect(clones[0].damage).toBe(2);
        expect(clones[0].exhausted).toBe(true);
    });

    it('SHIELD_USE decrements shields (clamped at 0)', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'SHIELD_GAIN', card: 'SOR#108', count: 2 },
            { seq: 'R1.A.3', t: 'SHIELD_USE', card: 'SOR#108', count: 1 },
        ] as any);
        // Must end non-zero so a broken (no-op) SHIELD_USE can't pass: 2 gained, 1 used → 1.
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')?.shields).toBe(1);
    });

    it('HEAL on a base raises baseHp to the reported value', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'DAMAGE', src: 'X', tgt: 'base@2', amt: 10, damageType: 'combat', hp: 20 },
            { seq: 'R1.A.2', t: 'HEAL', tgt: 'base@2', amt: 4, hp: 24 },
        ] as any);
        expect(s.players[2]?.baseHp).toBe(24);
    });

    it('READY clears the exhausted flag set by EXHAUST', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'EXHAUST', card: 'SOR#108' },
            { seq: 'R1.A.3', t: 'READY', card: 'SOR#108' },
        ] as any);
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')?.exhausted).toBe(false);
    });

    it('a TAKE_CONTROL with no zone (an early-1.0 note) leaves the board unchanged', function () {
        const base = [{ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' }];
        const before = JSON.stringify(fold(base as any).players[1]?.cards);
        const after = fold([
            ...base,
            { seq: 'R1.A.4', t: 'TAKE_CONTROL', p: 2, card: 'SOR#108' },
        ] as any).players[1]?.cards;
        expect(JSON.stringify(after)).toBe(before);
    });
});

// Resources are counted, never named (spec §10.1): the row is two numbers, and four records
// move them. A replay used to show "22/22 available" for a whole action phase because nothing
// carried the amount actually paid.
describe('fold resources', function () {
    const two = [
        { seq: 'R0.S.1', t: 'MOVE', card: 'A', from: 'hand', to: 'resource', p: 1 },
        { seq: 'R0.S.2', t: 'MOVE', card: 'B', from: 'hand', to: 'resource', p: 1 },
        { seq: 'R0.S.3', t: 'MOVE', card: 'C', from: 'hand', to: 'resource', p: 1 },
    ];

    it('EXHAUST_RESOURCES moves ready resources to exhausted; READY_RESOURCES moves them back', function () {
        const paid = fold([...two, { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 }] as any).players[1];
        expect([paid.resourcesReady, paid.resourcesExhausted]).toEqual([1, 2]);
        const readied = fold([
            ...two,
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.2', t: 'READY_RESOURCES', p: 1, amount: 1 },
            // A record for a resource that was already ready (a writer may emit one) finds
            // nothing exhausted and does nothing.
            { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ] as any).players[1];
        expect([readied.resourcesReady, readied.resourcesExhausted]).toEqual([3, 0]);
    });

    it('clamps to what the row holds, exactly as the engine exhausts min(amount, ready)', function () {
        const p = fold([...two, { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 5 }] as any).players[1];
        expect([p.resourcesReady, p.resourcesExhausted]).toEqual([0, 3]);
        const q = fold([{ seq: 'R1.A.0a', t: 'READY_RESOURCES', p: 1, amount: 5 }] as any).players[1];
        expect([q.resourcesReady, q.resourcesExhausted]).toEqual([0, 0]);
    });

    it('a resource that leaves the row exhausted comes out of the exhausted count', function () {
        // A card played from the resource row (Smuggle) pays for itself first, so it leaves
        // exhausted: without the flag the fold took a READY one and the split drifted by one.
        const p = fold([
            ...two,
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'A', from: 'resource', to: 'ground', p: 1, kind: 'unit', exhausted: true },
            { seq: 'R1.A.0c', t: 'MOVE', card: 'B', from: 'resource', to: 'hand', p: 1 },
        ] as any).players[1];
        expect([p.resourcesReady, p.resourcesExhausted]).toEqual([0, 1]);
    });

    it('a stolen resource shifts one resource in the bucket TAKE_CONTROL names', function () {
        const s = fold([
            ...two,
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.A.1a', t: 'TAKE_CONTROL', p: 2, card: 'A', zone: 'resource', from: 1, exhausted: true },
            { seq: 'R1.A.1b', t: 'TAKE_CONTROL', p: 2, card: 'B', zone: 'resource', from: 1 },
        ] as any);
        expect([s.players[1]?.resourcesReady, s.players[1]?.resourcesExhausted]).toEqual([1, 0]);
        expect([s.players[2]?.resourcesReady, s.players[2]?.resourcesExhausted]).toEqual([1, 1]);
    });
});

// Credits and the Force are the only counted things that live in `base`; they move on the
// token's own MOVE, and change hands on a TAKE_CONTROL whose zone is `base` (spec §12.1).
describe('fold credits and the Force', function () {
    it('a Credit token entering and leaving the base drives `credits`', function () {
        const s = fold([
            { seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:credit#8015500527', from: 'outsideTheGame', to: 'base', p: 2 },
            { seq: 'R1.A.1b', t: 'MOVE', card: 'TOKEN:credit#8015500527:2', from: 'outsideTheGame', to: 'base', p: 2 },
            { seq: 'R2.A.0a', t: 'MOVE', card: 'TOKEN:credit#8015500527', from: 'base', to: 'outsideTheGame', p: 2 },
            { seq: 'R2.A.0b', t: 'DEFEAT', card: 'TOKEN:credit#8015500527', reason: 'ability' },
        ] as any);
        expect(s.players[2]?.credits).toBe(1);
        expect(s.players[2]?.cards).toEqual([]);   // a token in the base is not an arena card
    });

    it('a Credit token changing hands is a TAKE_CONTROL in the base zone', function () {
        const s = fold([
            { seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:credit#8015500527', from: 'outsideTheGame', to: 'base', p: 2 },
            { seq: 'R1.A.2a', t: 'TAKE_CONTROL', p: 1, card: 'TOKEN:credit#8015500527', zone: 'base', from: 2 },
        ] as any);
        expect([s.players[1]?.credits, s.players[2]?.credits]).toEqual([1, 0]);
    });

    it('the Force token on and off the base drives `hasForce`', function () {
        const on = fold([{ seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:the-force#force-id', from: 'outsideTheGame', to: 'base', p: 1 }] as any);
        expect(on.players[1]?.hasForce).toBe(true);
        const off = fold([
            { seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:the-force#force-id', from: 'outsideTheGame', to: 'base', p: 1 },
            { seq: 'R1.A.2a', t: 'MOVE', card: 'TOKEN:the-force#force-id', from: 'base', to: 'outsideTheGame', p: 1 },
        ] as any);
        expect(off.players[1]?.hasForce).toBe(false);
    });
});

// `attachedTo` is the normative binding (spec §10.1) and the fold now uses it; a card leaving
// an arena or being defeated comes off every host, keyed on the zone transition, not `kind`.
describe('fold attachments', function () {
    const host = { seq: 'R1.A.0a', t: 'MOVE', card: 'LOF#164', from: 'hand', to: 'ground', p: 1, kind: 'unit' };

    it('an attaching MOVE puts a printed upgrade on its host once, with the PLAY_UPGRADE beside it', function () {
        const s = fold([
            host,
            { seq: 'R1.A.1a', t: 'MOVE', card: 'LOF#215', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'LOF#164' },
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', zone: 'ground', target: 'LOF#164', cost: 2 },
        ] as any);
        expect(s.players[1]?.cards[0].upgrades).toEqual(['LOF#215']);
    });

    it('a token upgrade never enters `upgrades[]`: it is a counter', function () {
        const s = fold([
            host,
            { seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:weakness#weakness-id', from: 'outsideTheGame', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'LOF#164' },
            { seq: 'R1.A.1b', t: 'STATUS_TOKEN', card: 'LOF#164', token: 'weakness', count: 1 },
        ] as any);
        expect(s.players[1]?.cards[0].upgrades).toEqual([]);
        expect(s.players[1]?.cards[0].statusTokens).toEqual({ weakness: 1 });
    });

    it('a defeated upgrade, and a pilot whose exit says kind unit, both come off the host', function () {
        const s = fold([
            host,
            { seq: 'R1.A.1a', t: 'MOVE', card: 'LOF#215', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'LOF#164' },
            { seq: 'R1.A.2a', t: 'MOVE', card: 'JTL#058', from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'LOF#164' },
            // The cable is defeated: MOVE out (host-less) then DEFEAT.
            { seq: 'R1.A.3a', t: 'MOVE', card: 'LOF#215', from: 'ground', to: 'discard', p: 1, kind: 'upgrade' },
            { seq: 'R1.A.3b', t: 'DEFEAT', card: 'LOF#215', reason: 'frameworkEffect' },
            // The pilot leaves as a unit card (its role reverts once detached).
            { seq: 'R1.A.4a', t: 'MOVE', card: 'JTL#058', from: 'ground', to: 'discard', p: 1, kind: 'unit' },
        ] as any);
        expect(s.players[1]?.cards.map((c) => c.id)).toEqual(['LOF#164']);   // the pilot never became a body
        expect(s.players[1]?.cards[0].upgrades).toEqual([]);
        // Both exits are a MOVE into `discard`, and the MOVE is what files the pile — so a
        // defeated upgrade and a departing pilot both land there, in the order they left.
        // (This previously expected `[]`: DEFEAT was the pile's only author and it fires after
        // the MOVE that already removed the card, so nothing ever reached the discard.)
        expect(s.players[1]?.discard).toEqual(['LOF#215', 'JTL#058']);
    });

    // A stolen resource must move in the MEMBERSHIP list as well as the counts. Missing this,
    // every keyframe after the steal mismatches on both seats, because the adapter puts
    // `resources` in every keyframe and the gate compares it as a set.
    it('TAKE_CONTROL of a resource moves it between the seats\' resource lists', function () {
        const s = fold([
            { seq: 'R1.A.1a', t: 'MOVE', card: 'SOR#001', from: 'hand', to: 'resource', p: 1 },
            { seq: 'R1.A.1b', t: 'MOVE', card: 'SOR#002', from: 'hand', to: 'resource', p: 2 },
            { seq: 'R1.A.2', t: 'TAKE_CONTROL', p: 2, card: 'SOR#001', zone: 'resource', from: 1 },
        ] as any);
        expect(s.players[1]?.resources).toEqual([]);
        expect(s.players[2]?.resources).toEqual(['SOR#002', 'SOR#001']);
        expect(s.players[1]?.resourcesReady).toBe(0);
        expect(s.players[2]?.resourcesReady).toBe(2);
    });

    // `active` is seat-typed, and a .swupgn is untrusted input: a reader doing the obvious
    // `players[state.active]` must never be handed "__proto__".
    it('ignores a non-seat `active` rather than storing it', function () {
        const ok = fold([{ seq: 'R1.start', t: 'ROUND_START', round: 1, active: 2 }] as any);
        expect(ok.active).toBe(2);
        const hostile = fold([{ seq: 'R1.start', t: 'ROUND_START', round: 1, active: '__proto__' }] as any);
        expect(hostile.active).toBeUndefined();
        expect(({} as any).polluted).toBeUndefined();
    });

    // A double-sided leader never deploys, so before any keyframe nothing has named the seat's
    // leader. The flip has to seed one or the face is dropped.
    it('records a LEADER_FLIP even when no keyframe has named the leader yet', function () {
        const s = fold([
            { seq: 'R1.A.1a', t: 'LEADER_FLIP', p: 1, card: 'TWI#017', onStartingSide: false },
        ] as any);
        expect(s.players[1]?.leader?.id).toBe('TWI#017');
        expect(s.players[1]?.leader?.onStartingSide).toBe(false);
    });

    it('a DEFEAT alone (no MOVE seen) still detaches', function () {
        const s = fold([
            host,
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'LOF#215', target: 'LOF#164' },
            { seq: 'R1.A.3b', t: 'DEFEAT', card: 'LOF#215', reason: 'ability' },
        ] as any);
        expect(s.players[1]?.cards[0].upgrades).toEqual([]);
    });
});

// CR 1.16 lists the game state; these are the parts the file carries that no arena card does.
describe('fold game state beyond the arenas', function () {
    it('STATS states a unit\'s live numbers and keywords; nothing is derived', function () {
        const s = fold([
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.0b', t: 'STATS', card: 'SOR#095', power: 3, hp: 3, keywords: [] },
            { seq: 'R1.A.2a', t: 'STATS', card: 'SOR#095', power: 5, hp: 3, keywords: ['sentinel', 'raid 2'] },
        ] as any);
        expect(s.players[1]?.cards[0]).toEqual(jasmine.objectContaining({ power: 5, hp: 3, keywords: ['raid 2', 'sentinel'] }));
    });

    it('the leader: named and readied by DEPLOY_LEADER, exhausted by EXHAUST, home again on the MOVE back, its Epic Action spent', function () {
        const events: any[] = [
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'SOR#010', zone: 'ground', epic: true },
            { seq: 'R1.A.1a', t: 'MOVE', card: 'SOR#010', from: 'base', to: 'ground', p: 1 },
            { seq: 'R2.A.3a', t: 'MOVE', card: 'SOR#010', from: 'ground', to: 'base', p: 1 },
            { seq: 'R2.A.3b', t: 'EXHAUST', card: 'SOR#010' },
        ];
        const deployed = fold(events.slice(0, 2)).players[1]?.leader;
        expect(deployed).toEqual({ id: 'SOR#010', deployed: true, exhausted: false, epicActionUsed: true });
        const home = fold(events).players[1];
        expect(home.leader).toEqual({ id: 'SOR#010', deployed: false, exhausted: true, epicActionUsed: true });
        expect(home.cards).toEqual([]);
        // Readied at regroup like anything else.
        expect(fold([...events, { seq: 'R2.G.1', t: 'READY', card: 'SOR#010' }]).players[1]?.leader?.exhausted).toBe(false);
        // A non-epic ability on the leader spends nothing; an epic one does.
        const kf: any = { seq: 'R1.start', t: 'ROUND_START', round: 1, keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [], leader: { id: 'SOR#010', deployed: false, exhausted: false, epicActionUsed: false } },
            2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } };
        expect(fold([kf, { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'SOR#010', ability: 'x' }]).players[1]?.leader?.epicActionUsed).toBe(false);
        expect(fold([kf, { seq: 'R1.A.1', t: 'ABILITY_ACTIVATE', p: 1, card: 'SOR#010', ability: 'x', epic: true }]).players[1]?.leader?.epicActionUsed).toBe(true);
    });

    it('deck count follows MOVE once a keyframe has supplied it; initiative status resets each round', function () {
        const kf: any = { seq: 'R1.start', t: 'ROUND_START', round: 1, keyframe: { round: 1, phase: 'action', initiative: 1, initiativeTaken: false, players: { 1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [], deckSize: 10 },
            2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } } } };
        const s = fold([
            kf,
            { seq: 'R1.A.1', t: 'CLAIM_INITIATIVE', p: 2 },
            { seq: 'R1.G.1', t: 'MOVE', card: 'A', from: 'deck', to: 'hand', p: 1 },
            { seq: 'R1.G.2', t: 'MOVE', card: 'B', from: 'hand', to: 'deck', p: 1 },
            { seq: 'R1.G.3', t: 'MOVE', card: 'C', from: 'deck', to: 'hand', p: 1 },
            { seq: 'R1.G.4', t: 'MOVE', card: 'D', from: 'deck', to: 'hand', p: 2 },   // never told: stays unknown
        ] as any);
        expect(s.players[1]?.deckSize).toBe(9);
        expect(s.players[2]?.deckSize).toBeUndefined();
        expect(s.initiative).toBe(2);
        expect(s.initiativeTaken).toBe(true);
        expect(fold([kf, { seq: 'R1.A.1', t: 'CLAIM_INITIATIVE', p: 2 }, { seq: 'R2.start', t: 'ROUND_START', round: 2 }] as any).initiativeTaken).toBe(false);
    });
});

describe('fold capture', function () {
    const board = [
        { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
        { seq: 'R1.A.1a', t: 'MOVE', card: 'SOR#095:2', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
    ];

    it('CAPTURE files the card under its captor; the MOVE into `capture` took it off the board', function () {
        const s = fold([
            ...board,
            { seq: 'R1.A.2a', t: 'MOVE', card: 'SOR#095:2', from: 'ground', to: 'capture', p: 2, kind: 'unit' },
            { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095:2', by: 'SOR#095' },
        ] as any);
        expect(s.players[2]?.cards).toEqual([]);
        expect(s.players[1]?.cards[0].captured).toEqual(['SOR#095:2']);
    });

    it('RESCUE and the MOVE out of `capture` put it back, whichever comes first', function () {
        const captured = [
            ...board,
            { seq: 'R1.A.2a', t: 'MOVE', card: 'SOR#095:2', from: 'ground', to: 'capture', p: 2, kind: 'unit' },
            { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095:2', by: 'SOR#095' },
        ];
        for (const order of [
            [{ seq: 'R2.A.1a', t: 'RESCUE', p: 2, card: 'SOR#095:2' }, { seq: 'R2.A.1b', t: 'MOVE', card: 'SOR#095:2', from: 'capture', to: 'ground', p: 2, kind: 'unit' }],
            [{ seq: 'R2.A.1a', t: 'MOVE', card: 'SOR#095:2', from: 'capture', to: 'ground', p: 2, kind: 'unit' }, { seq: 'R2.A.1b', t: 'RESCUE', p: 2, card: 'SOR#095:2' }],
        ]) {
            const s = fold([...captured, ...order] as any);
            expect(s.players[1]?.cards[0].captured).toEqual([]);
            expect(s.players[2]?.cards.map((c) => c.id)).toEqual(['SOR#095:2']);
        }
    });

    it('a CAPTURE without `by` still takes the card off the board, and files it nowhere', function () {
        const s = fold([...board, { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095:2' }] as any);
        expect(s.players[2]?.cards).toEqual([]);
        expect(s.players[1]?.cards[0].captured).toEqual([]);
        expect(s.players[1]?.baseCaptured).withContext('absent means "not recorded", not "none"')
            .toBeUndefined();
    });

    // Arrest: "Your base captures an enemy non-leader unit". The base, not a unit, holds it.
    const arrested = [
        ...board,
        { seq: 'R1.A.2a', t: 'MOVE', card: 'SOR#095:2', from: 'ground', to: 'capture', p: 2, kind: 'unit' },
        { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095:2', by: 'base@1' },
    ];

    it('a base captor holds the card in its seat\'s baseCaptured, not on any unit', function () {
        const s = fold(arrested as any);
        expect(s.players[2]?.cards).toEqual([]);
        expect(s.players[1]?.baseCaptured).toEqual(['SOR#095:2']);
        expect(s.players[1]?.cards[0].captured).toEqual([]);
        expect(s.players[2]?.baseCaptured).toBeUndefined();
    });

    it('a CAPTURE repeated for the same card is idempotent on the base', function () {
        const s = fold([...arrested, arrested[3]] as any);
        expect(s.players[1]?.baseCaptured).toEqual(['SOR#095:2']);
    });

    it('a base\'s captive is released by RESCUE and the MOVE out of `capture`, whichever comes first', function () {
        for (const order of [
            [{ seq: 'R1.regroup.1a', t: 'RESCUE', p: 2, card: 'SOR#095:2' }, { seq: 'R1.regroup.1b', t: 'MOVE', card: 'SOR#095:2', from: 'capture', to: 'ground', p: 2, kind: 'unit' }],
            [{ seq: 'R1.regroup.1a', t: 'MOVE', card: 'SOR#095:2', from: 'capture', to: 'ground', p: 2, kind: 'unit' }, { seq: 'R1.regroup.1b', t: 'RESCUE', p: 2, card: 'SOR#095:2' }],
        ]) {
            const s = fold([...arrested, ...order] as any);
            expect(s.players[1]?.baseCaptured).toEqual([]);
            expect(s.players[2]?.cards.map((c) => c.id)).toEqual(['SOR#095:2']);
        }
    });
});

// A card arrives twice in a real stream: as the MOVE (the fold's source of truth) and as the
// PLAY summary beside it. Placement must be idempotent, or every unit in play is duplicated —
// which is invisible while keyframes keep snapping state back, but wrong for stateAt() between
// two keyframes, i.e. exactly what a replay scrubber asks for.
describe('fold arena membership', function () {
    it('does not duplicate a card that both MOVE and PLAY report', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#095', zone: 'ground', cost: 2 },
        ];
        expect(fold(events).players[1]?.cards.map((c) => c.id)).toEqual(['SOR#095']);
    });

    // Shield/Experience/Advantage/Weakness are token UPGRADES; Battle Droid/X-Wing/Beast are
    // token UNITS. Both are TOKEN:<name>#<id>, so only `kind` can tell them apart.
    it('keeps an upgrade out of the arena but still counts it leaving hand', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.0a', t: 'MOVE', card: 'SOR#095', from: 'hand', to: 'ground', p: 1, kind: 'unit' },
            { seq: 'R1.A.0b', t: 'MOVE', card: 'X', from: 'deck', to: 'hand', p: 1 },
            { seq: 'R1.A.1a', t: 'MOVE', card: 'SOR#071', from: 'hand', to: 'ground', p: 1, kind: 'upgrade' },
            { seq: 'R1.A.1b', t: 'MOVE', card: 'TOKEN:advantage#5844562972', from: 'outsideTheGame', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'SOR#095' },
        ];
        const p = fold(events).players[1];
        expect(p.cards.map((c) => c.id)).toEqual(['SOR#095']);   // neither upgrade is in play
        expect(p.handSize).toBe(0);                              // 1 drawn, 1 played out of hand
    });

    it('places a token UNIT in the arena', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1a', t: 'MOVE', card: 'TOKEN:battle-droid#3463348370', from: 'outsideTheGame', to: 'ground', p: 2, kind: 'unit' },
        ];
        expect(fold(events).players[2]?.cards.map((c) => c.id)).toEqual(['TOKEN:battle-droid#3463348370']);
    });

    it('never puts an upgrade in the arena via PLAY_UPGRADE with an untracked host', function () {
        const events: GameEvent[] = [
            { seq: 'R1.A.1', t: 'PLAY_UPGRADE', p: 1, card: 'SOR#071', target: 'NOT#TRACKED', zone: 'ground', cost: 3 },
        ];
        expect(fold(events).players[1]?.cards).toEqual([]);
    });

    describe('untrusted input', function () {
        // `Seat` is erased at runtime, so `p` out of a hand-edited file can be any JSON value.
        // A `p` of "__proto__" used to resolve `s.players[p]` to Object.prototype, and every
        // subsequent count write landed on it -- poisoning every object in the process.
        it('does not write to Object.prototype when a seat is "__proto__"', function () {
            const events = [
                { seq: 'R1.A.1', t: 'MOVE', p: '__proto__', card: 'X#1', from: 'deck', to: 'hand' },
            ] as unknown as GameEvent[];

            fold(events);

            expect((Object.prototype as any).handSize).toBeUndefined();
            expect(({} as any).handSize).toBeUndefined();
        });

        it('ignores counts for a seat that is not 1 or 2', function () {
            const events = [
                { seq: 'R1.A.1', t: 'MOVE', p: 7, card: 'X#1', from: 'deck', to: 'hand' },
            ] as unknown as GameEvent[];

            const state = fold(events);

            expect(Object.keys(state.players).sort()).toEqual(['1', '2']);
            expect(state.players[1]?.handSize).toBe(0);
            expect(state.players[2]?.handSize).toBe(0);
        });
    });

    describe('MOVE without a seat', function () {
        it('updates zone on an already-tracked card without touching counts', function () {
            const events = [
                { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground', cost: 2 },
                { seq: 'R1.A.2', t: 'MOVE', card: 'SOR#108', from: 'ground', to: 'discard' },
            ] as unknown as GameEvent[];

            const p1 = fold(events).players[1];

            expect(p1.cards.find((c) => c.id === 'SOR#108').zone).toBe('discard');
            expect(p1.handSize).toBe(0);
            expect(p1.resourcesReady).toBe(0);
        });

        it('ignores a seatless MOVE for a card it is not tracking', function () {
            const events = [
                { seq: 'R1.A.1', t: 'MOVE', card: 'NOT#TRACKED', from: 'deck', to: 'hand' },
            ] as unknown as GameEvent[];

            const s = fold(events);

            expect(s.players[1]?.cards).toEqual([]);
            expect(s.players[1]?.handSize).toBe(0);
            expect(s.players[2]?.handSize).toBe(0);
        });
    });

    describe('damaged keyframes and hostile fields (spec §13, trust boundary)', function () {
        it('ignores a keyframe missing a seat or with non-array fields, and keeps folding', function () {
            const hostile: GameEvent[] = [
                ev({ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' }),
                { seq: 'R1.end', t: 'ROUND_END', round: 1, keyframe: { players: {} } } as any,
                { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: 1 } as any,
                { seq: 'R2.A.1', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 1, players: { 1: { cards: 'x', hand: [], discard: [] }, 2: {} } } } as any,
                ev({ seq: 'R2.A.1a', t: 'DRAW', p: 1, count: 1, cards: 5 as any }),
                ev({ seq: 'R2.A.1b', t: 'DISCARD', p: 1, cards: null as any }),
            ];
            expect(() => fold(hostile)).not.toThrow();
            const s = fold(hostile);
            expect(s.round).toBe(2);
            expect(s.players[1]?.cards.map((c) => c.id)).toEqual(['SOR#108']);
        });

        it('stateAt folds from the nearest usable keyframe and equals a fold from the start', function () {
            const seat = (n: 1 | 2) => ({ seat: n, baseHp: 30, baseMaxHp: 30, handSize: 2, hand: [], resourcesReady: 3, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] });
            const withKeyframes: GameEvent[] = [
                ev({ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#001', zone: 'ground' }),
                { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: { round: 2, phase: 'action', initiative: 2, players: { 1: seat(1), 2: seat(2) } } } as any,
                ev({ seq: 'R2.A.1', t: 'PLAY', p: 2, card: 'SOR#002', zone: 'space' }),
                ev({ seq: 'R2.A.2', t: 'PLAY', p: 1, card: 'SOR#003', zone: 'ground' }),
            ];
            const at = stateAt(withKeyframes, 'R2.A.1');
            expect(at).toEqual(fold(withKeyframes.slice(0, 3)));
            expect(at.players[2]?.cards.map((c) => c.id)).toEqual(['SOR#002']);
            expect(at.players[1]?.cards).toEqual([]); // the keyframe replaced R1's board
        });
    });
});

// A zone list is bounded by deck size in any real game, so a list this long cannot come from
// honest play. This parses UNTRUSTED files in a browser: addOnce scans the list on every add, so
// an unbounded `cards[]` in a DRAW would cost O(n^2) string comparisons and hang the tab. Past
// the cap the id is dropped rather than the file rejected -- degrading is the fold's contract.
describe('fold zone list cap', function () {
    it('drops ids past the cap instead of growing the list without bound', function () {
        const ids = Array.from({ length: 1005 }, (_, i) => `TOKEN:x${i}`);
        const s = fold([{ seq: 'R1.A.1', t: 'DRAW', p: 1, count: ids.length, cards: ids }] as any);
        expect(s.players[1]?.hand.length).toBe(1000);
        // The ones under the cap are kept, in order; nothing past it is silently substituted in.
        expect(s.players[1]?.hand[0]).toBe('TOKEN:x0');
        expect(s.players[1]?.hand[999]).toBe('TOKEN:x999');
        expect(s.players[1]?.hand).not.toContain('TOKEN:x1000');
    });

    it('does not throw when a card past the cap is later referenced', function () {
        const ids = Array.from({ length: 1001 }, (_, i) => `TOKEN:x${i}`);
        expect(() => fold([
            { seq: 'R1.A.1', t: 'DRAW', p: 1, count: ids.length, cards: ids },
            { seq: 'R1.A.2', t: 'DISCARD', p: 1, cards: ['TOKEN:x1000'] },
        ] as any)).not.toThrow();
    });
});

// Both of these are reachable from a schema-VALID file: validation passing is not the same as
// the fold being safe to run on the result.
describe('fold hardening against crafted files', function () {
    it('bounds arena growth, so a file of unique arena MOVEs cannot make the fold quadratic', function () {
        // findCard() scans every card in play, so an unbounded arena is O(n^2) to fold. A real
        // game never approaches the cap; only a crafted file does.
        const events: any[] = [];
        for (let i = 0; i < 1500; i++) {
            events.push({ seq: `R1.A.${i}`, t: 'MOVE', card: `SOR#${i}`, from: 'hand', to: 'ground', p: 1 });
        }
        const s = fold(events as any);
        expect(s.players[1].cards.length).toBe(1000);
    });

    it('refuses to snap to a keyframe whose card is missing a list the fold dereferences', function () {
        // `{id, zone}` with no `upgrades` passed as "complete", the fold snapped to it, and the
        // next exit from that arena crashed in detach() on c.upgrades.indexOf.
        const halfCard = { round: 2, phase: 'action' as const, initiative: 1 as const, players: {
            1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
                resourcesExhausted: 0, credits: 0, hasForce: false, discard: [],
                cards: [{ id: 'SOR#108', zone: 'ground' }] },
            2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0,
                resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
        } };
        const events = [
            { seq: 'R2.start', t: 'ROUND_START', round: 2, keyframe: halfCard },
            { seq: 'R2.A.1', t: 'MOVE', card: 'SOR#108', from: 'ground', to: 'discard', p: 1 },
        ] as any;
        expect(() => fold(events)).not.toThrow();
    });
});

// Fortify: an upgrade attached to a BASE lives in the seat's `baseUpgrades`, never in `cards`.
describe('fold base attachments and base defeat', function () {
    // Value: protects=base-upgrade attach seat (attachedTo>p), token skip, PLAY_UPGRADE base@N, exit/DEFEAT detach; fails_when=seat from p, tokens attach, DEFEAT-only no detach; why_new=engine never omits attachedTo; seam=none; no_claim=engine
    it('attaches a base upgrade to the seat its base ref names (else p), never a token, and detaches on exit or DEFEAT', function () {
        const s = fold([
            // attachedTo names seat 2's base even though the MOVE's p is 1: the base ref wins.
            { seq: 'R1.A.1a', t: 'MOVE', card: 'HMW#271', from: 'hand', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@2' },
            // A writer that predates attachedTo on base moves is read by its p.
            { seq: 'R1.A.2a', t: 'MOVE', card: 'HMW#147', from: 'hand', to: 'base', p: 1, kind: 'upgrade' },
            // A token never attaches to a base; a unit-kind MOVE into base (a leader going home) is no attachment.
            { seq: 'R1.A.3a', t: 'MOVE', card: 'TOKEN:weakness#1', from: 'outsideTheGame', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' },
            { seq: 'R1.A.4a', t: 'MOVE', card: 'SOR#010', from: 'ground', to: 'base', p: 1, kind: 'unit' },
            // PLAY_UPGRADE alone on base@N attaches there, and is idempotent beside its MOVE.
            { seq: 'R1.A.5', t: 'PLAY_UPGRADE', p: 2, card: 'HMW#126', zone: 'base', target: 'base@2' },
            { seq: 'R1.A.6', t: 'PLAY_UPGRADE', p: 1, card: 'HMW#147', zone: 'base', target: 'base@1' },
        ] as any);
        expect(s.players[1]?.baseUpgrades).toEqual(['HMW#147']);
        expect(s.players[2]?.baseUpgrades).toEqual(['HMW#271', 'HMW#126']);
        expect(s.players[1]?.cards.map((c) => c.id)).not.toContain('HMW#147');
        expect(s.players[2]?.cards.length).toBe(0);

        // Exits name no host: the zone transition alone detaches; a DEFEAT with no paired MOVE does too.
        const attach = (card: string, seq: string) => ({ seq, t: 'MOVE', card, from: 'hand', to: 'base', p: 1, kind: 'upgrade', attachedTo: 'base@1' });
        const d = fold([
            attach('HMW#271', 'R1.A.1a'),
            attach('HMW#147', 'R1.A.2a'),
            attach('HMW#126', 'R1.A.3a'),
            { seq: 'R1.A.4a', t: 'MOVE', card: 'HMW#271', from: 'base', to: 'discard', p: 1 },
            { seq: 'R1.A.5a', t: 'DEFEAT', card: 'HMW#147', reason: 'ability' },
        ] as any);
        expect(d.players[1]?.baseUpgrades).toEqual(['HMW#126']);
        expect(d.players[1]?.discard).toContain('HMW#271');
        expect(d.players[2]?.baseUpgrades).withContext('absent means "not recorded", not "none"')
            .toBeUndefined();
    });

    // Value: protects=DEFEAT base@N sets only baseDefeated; fails_when=base DEFEAT falls through to card path or touches HP/discard/upgrades; why_new=engine specs only check the flag; seam=none; no_claim=GAME_END ordering
    it('a DEFEAT on base@N sets baseDefeated and changes nothing else', function () {
        const before = [
            { seq: 'R1.A.1a', t: 'MOVE', card: 'HMW#126', from: 'hand', to: 'base', p: 2, kind: 'upgrade', attachedTo: 'base@2' },
            { seq: 'R1.A.2a', t: 'DAMAGE', src: 'SOR#108', tgt: 'base@2', amt: 20, damageType: 'combat', hp: 10 },
        ] as any[];
        const s0 = fold(before);
        const s = fold([...before, { seq: 'R1.A.3a', t: 'DEFEAT', card: 'base@2', reason: 'ability', defeatedBy: 'HMW#004' }] as any);
        expect(s.players[2]?.baseDefeated).toBe(true);
        expect(s.players[1]?.baseDefeated).toBeUndefined();
        const { baseDefeated, ...rest } = s.players[2] as any;
        expect(rest).toEqual(JSON.parse(JSON.stringify(s0.players[2])));
        expect(baseDefeated).toBe(true);
        expect(s.players[2]?.baseHp).toBe(10);
        expect(s.players[2]?.baseUpgrades).toEqual(['HMW#126']);
    });
});

// Value: protects=a keyframe whose lists exceed MAX_ZONE_LIST is not snapped to; fails_when=the cap check is dropped and a crafted keyframe installs an unbounded list; why_new=only fold-grown lists were capped; seam=none; no_claim=real games never approach the cap
describe('fold keyframe trust boundary', function () {
    const seat = (n: 1 | 2, baseUpgrades: string[]) => ({
        seat: n, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0,
        credits: 0, hasForce: false, discard: [], cards: [], baseUpgrades,
    });
    const keyframed = (baseUpgrades: string[]) => fold([{
        seq: 'R1.start', t: 'ROUND_START', round: 1,
        keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: seat(1, baseUpgrades), 2: seat(2, []) } },
    } as any]);

    it('snaps to a keyframe with real-sized lists, and ignores one past the cap', function () {
        expect(keyframed(['HMW#271', 'HMW#147']).players[1]?.baseUpgrades).toEqual(['HMW#271', 'HMW#147']);
        const huge = Array.from({ length: 1001 }, (_, i) => `HMW#${i}`);
        const s = keyframed(huge);
        expect(s.players[1]?.baseUpgrades).withContext('the damaged keyframe is not snapped to')
            .toBeUndefined();
        expect(s.round).toBe(1);
    });

    // Value: protects=a keyframe card whose upgrades list exceeds MAX_ZONE_LIST is not snapped to; fails_when=the per-card upgrades cap is dropped and a crafted keyframe installs an unbounded upgrades list; why_new=the cap test above only grows a player-level list; seam=none; no_claim=real games never approach the cap
    it('ignores a keyframe whose card carries an upgrades list past the cap', function () {
        const withUnit = (upgrades: string[]) => fold([{
            seq: 'R1.start', t: 'ROUND_START', round: 1,
            keyframe: { round: 1, phase: 'action', initiative: 1, players: {
                1: { ...seat(1, []), cards: [{ id: 'SOR#010', zone: 'ground', damage: 0, exhausted: false, upgrades, shields: 0, experience: 0, statusTokens: {}, captured: [] }] },
                2: seat(2, []),
            } },
        } as any]);
        expect(withUnit(['SOR#120']).players[1]?.cards.map((c) => c.upgrades)).toEqual([['SOR#120']]);
        const s = withUnit(Array.from({ length: 1001 }, (_, i) => `SOR#${i}`));
        expect(s.players[1]?.cards).withContext('the damaged keyframe is not snapped to')
            .toEqual([]);
        expect(s.round).toBe(1);
    });

    // Value: protects=a keyframe card missing statusTokens (or its counters) is not snapped to, so a later STATUS_TOKEN cannot throw; fails_when=the card check covers upgrades only; why_new=the check above only tested the upgrades list; seam=none; no_claim=real games always write full cards
    it('ignores a keyframe whose card lacks its token map, and never throws on a later STATUS_TOKEN', function () {
        const events = [{
            seq: 'R1.start', t: 'ROUND_START', round: 1,
            keyframe: { round: 1, phase: 'action', initiative: 1, players: {
                1: { ...seat(1, []), cards: [{ id: 'SOR#010', zone: 'ground', upgrades: [] }] },
                2: seat(2, []),
            } },
        }, { seq: 'R1.A.1a', t: 'STATUS_TOKEN', card: 'SOR#010', token: 'advantage', count: 1 }];
        let s: any;
        expect(() => {
            s = fold(events as any);
        }).not.toThrow();
        expect(s.players[1]?.cards).toEqual([]);
    });
});

describe('fold upgrade hosts', function () {
    const move = (seq: string, card: string, from: string, to: string, kind: 'unit' | 'upgrade', attachedTo?: string) =>
        ({ seq, t: 'MOVE', card, from, to, p: 1, kind, ...(attachedTo ? { attachedTo } : {}) });
    const hosts = (s: any) => s.players[1].cards.map((c: any) => [c.id, c.upgrades]);

    // Value: protects=an upgrade moved to a host in the other arena comes off the old host; fails_when=only an arena exit detaches; why_new=no record moved an upgrade between hosts; seam=none; no_claim=same-arena moves (the writer records none)
    it('takes an upgrade moved to a host in the other arena off its old host', function () {
        const s = fold([
            move('R1.A.1', 'SOR#001', 'hand', 'ground', 'unit'),
            move('R1.A.2', 'SOR#002', 'hand', 'space', 'unit'),
            move('R1.A.3', 'SOR#120', 'hand', 'ground', 'upgrade', 'SOR#001'),
            move('R1.A.4', 'SOR#120', 'ground', 'space', 'upgrade', 'SOR#002'),
        ] as any);
        expect(hosts(s)).toEqual([['SOR#001', []], ['SOR#002', ['SOR#120']]]);
    });

    // Value: protects=a unit in play attached as a pilot leaves the arena list and appears only on its vehicle; fails_when=the upgrade branch only updates the tracked card's zone; why_new=pilot tests played the pilot from hand; seam=none; no_claim=which cards do this (Poe Dameron, One Hell of a Pilot)
    it('takes a unit in play that is attached as a pilot out of the arena list', function () {
        const s = fold([
            move('R1.A.1', 'JTL#001', 'hand', 'ground', 'unit'),
            move('R1.A.2', 'JTL#002', 'hand', 'space', 'unit'),
            move('R1.A.3', 'JTL#001', 'ground', 'space', 'upgrade', 'JTL#002'),
        ] as any);
        expect(hosts(s)).toEqual([['JTL#002', ['JTL#001']]]);
    });

    // Value: protects=a pilot ejected from a space vehicle is a ground unit only, not also its vehicle's upgrade; fails_when=only an arena exit detaches (space -> ground is arena to arena); why_new=no record moved an attached pilot between arenas as a unit; seam=none; no_claim=the writer's side of Eject
    it('takes a pilot ejected from a space vehicle off the vehicle', function () {
        const s = fold([
            move('R1.A.1', 'JTL#002', 'hand', 'space', 'unit'),
            move('R1.A.2', 'JTL#001', 'hand', 'space', 'upgrade', 'JTL#002'),
            move('R1.A.3', 'JTL#001', 'space', 'ground', 'unit'),
        ] as any);
        expect(hosts(s)).toEqual([['JTL#002', []], ['JTL#001', []]]);
    });
});

describe('fold of untrusted counters', function () {
    const unit = { seq: 'R1.A.1', t: 'MOVE', card: 'SOR#001', from: 'hand', to: 'ground', p: 1, kind: 'unit' };

    // Value: protects=a status token named like an inherited property never becomes a key (§23) and a non-numeric count changes nothing; fails_when=the fold writes a reserved name, reads the prototype or adds a string to a number; why_new=fold trusted every record's count and token; seam=none; no_claim=validate() rejecting these files
    it('skips reserved token names and ignores counts that are not finite numbers', function () {
        const s = fold([
            unit,
            { seq: 'R1.A.1a', t: 'STATUS_TOKEN', card: 'SOR#001', token: 'toString', count: 1 },
            { seq: 'R1.A.1b', t: 'STATUS_TOKEN', card: 'SOR#001', token: '__proto__', count: 2 },
            { seq: 'R1.A.1c', t: 'SHIELD_GAIN', card: 'SOR#001', count: 'lots' },
            { seq: 'R1.A.1d', t: 'EXPERIENCE_GAIN', card: 'SOR#001', count: null },
        ] as any);
        const card = s.players[1].cards[0];
        expect(Object.getOwnPropertyNames(card.statusTokens)).toEqual([]);
        expect(Object.getPrototypeOf(card.statusTokens)).toBe(Object.prototype);
        expect(card.shields).toBe(1);
        expect(card.experience).toBe(0);
    });

    // Value: protects=a file naming thousands of token kinds folds in bounded time and size; fails_when=every record copies the whole map and nothing caps it; why_new=no spec stressed STATUS_TOKEN; seam=none; no_claim=a wall-clock bound (asserted on size, not time)
    it('caps the number of distinct status tokens a card can hold', function () {
        const records: any[] = [unit];
        for (let i = 0; i < 3000; i++) {
            records.push({ seq: `R1.A.1x${i}`, t: 'STATUS_TOKEN', card: 'SOR#001', token: `t${i}`, count: 1 });
        }
        const s = fold(records);
        expect(Object.keys(s.players[1].cards[0].statusTokens).length).toBe(1000);
    });
});


describe('fold cross-seat piles', function () {
    // Value: protects=a card leaving a pile is taken out of the pile that holds it, not out of p's; fails_when=applyMoveCounts removes from player(s, e.p) only, and Stolen AT-Hauler played from the opponent's discard stays in its owner's discard; why_new=no vector moves a card out of another seat's pile; seam=none; no_claim=deck membership is not modelled, so a cross-seat deck move is still counted on p
    it('takes a card played from the opponent\'s discard out of the owner\'s pile', function () {
        const s = fold([
            { seq: 'R7.A.1a', t: 'MOVE', card: 'JTL#221:3', from: 'hand', to: 'space', p: 1, kind: 'unit' },
            { seq: 'R7.A.1c', t: 'MOVE', card: 'JTL#221:3', from: 'space', to: 'discard', p: 1, kind: 'unit' },
            { seq: 'R7.A.9b', t: 'MOVE', card: 'JTL#221:3', from: 'discard', to: 'space', p: 2, kind: 'unit' },
        ] as GameEvent[]);
        expect(s.players[1]?.discard).toEqual([]);
        expect(s.players[2]?.discard).toEqual([]);
        expect(s.players[2]?.cards.map((c) => `${c.id}@${c.zone}`)).toEqual(['JTL#221:3@space']);
    });

    // Value: protects=hand and resource rows follow the same rule, counts included; fails_when=only discard is fixed; why_new=the test above covers discard only; seam=none; no_claim=no real card is known to play from the opponent's hand or resources
    it('takes a card out of the opponent\'s hand or resource row, and its count with it', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'MOVE', card: 'SOR#001', from: 'deck', to: 'hand', p: 1, kind: 'unit' },
            { seq: 'R1.A.2', t: 'MOVE', card: 'SOR#002', from: 'hand', to: 'resource', p: 1, kind: 'unit' },
            { seq: 'R1.A.3', t: 'MOVE', card: 'SOR#001', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
            { seq: 'R1.A.4', t: 'MOVE', card: 'SOR#002', from: 'resource', to: 'ground', p: 2, kind: 'unit' },
        ] as GameEvent[]);
        expect(s.players[1]?.hand).toEqual([]);
        expect(s.players[1]?.resources).toEqual([]);
        expect(s.players[1]?.resourcesReady).toBe(0);
        expect(s.players[2]?.handSize).toBe(0);
        expect(s.players[2]?.resourcesReady).toBe(0);
    });

    // Value: protects=a card no seat's pile holds is still taken from p's counts as before; fails_when=the cross-seat lookup drops the record when the card is untracked (a file folded from mid-game with no keyframe); why_new=the two tests above always track the card; seam=none; no_claim=none
    it('falls back to p when no pile holds the card', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'MOVE', card: 'SOR#001', from: 'deck', to: 'hand', p: 2, kind: 'unit' },
            { seq: 'R1.A.2', t: 'MOVE', card: 'SOR#009', from: 'hand', to: 'ground', p: 2, kind: 'unit' },
        ] as GameEvent[]);
        expect(s.players[2]?.handSize).toBe(0);
        expect(s.players[2]?.hand).toEqual(['SOR#001']);
    });
});

describe('fold leader records with no card', function () {
    // Value: protects=a schema-invalid leader record cannot throw or land on the wrong seat; fails_when=DEPLOY_LEADER reads prev.epicActionUsed off undefined, or leaderOwner(undefined) matches the first seat with no leader; why_new=every existing leader test names its card; seam=none; no_claim=the schema already rejects these records
    it('never throws, and never names a leader on the wrong seat', function () {
        for (const t of ['DEPLOY_LEADER', 'LEADER_FLIP', 'ABILITY_ACTIVATE', 'EXHAUST', 'READY']) {
            let s: any;
            expect(() => {
                s = fold([{ seq: 'R1.A.1', t, p: 2, epic: true, onStartingSide: false } as any]);
            }).withContext(t).not.toThrow();
            expect(s.players[1]?.leader).withContext(`${t}: seat 1`)
                .toBeUndefined();
            expect(s.players[2]?.leader).withContext(`${t}: seat 2`)
                .toBeUndefined();
            expect(s.players[2]?.cards).withContext(`${t}: no card without an id`)
                .toEqual([]);
        }
    });
});

describe('fold keyframe card captives', function () {
    const unit = (captured: unknown) => ({ id: 'SOR#010', zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {}, captured });
    const seat = (n: 1 | 2, cards: unknown[]) => ({
        seat: n, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0,
        credits: 0, hasForce: false, discard: [], cards,
    });
    const keyframed = (cards: unknown[]) => fold([{
        seq: 'R1.start', t: 'ROUND_START', round: 1,
        keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: seat(1, cards), 2: seat(2, []) } },
    } as any]);

    // Value: protects=a keyframe card whose captured is not a list, or is past the cap, is a damaged checkpoint; fails_when=isCompleteKeyframeCard checks upgrades only and render throws iterating captured; why_new=the card checks above never set captured; seam=none; no_claim=real games always write captured as a short list
    it('ignores a keyframe whose card carries a captured value that is not a capped list', function () {
        expect(keyframed([unit(['SOR#095'])]).players[1]?.cards.map((c) => c.captured)).toEqual([['SOR#095']]);
        expect(keyframed([unit(undefined)]).players[1]?.cards.length).withContext('absent is a file older than the field')
            .toBe(1);
        for (const bad of [5, {}, true, 'x', Array.from({ length: 1001 }, (_, i) => `SOR#${i}`)]) {
            expect(keyframed([unit(bad)]).players[1]?.cards).withContext(JSON.stringify(bad).slice(0, 20))
                .toEqual([]);
        }
    });
});

describe('fold keyframe snap normalisation', function () {
    const seat = (n: 1 | 2, cards: unknown[]) => ({
        seat: n, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0,
        credits: 0, hasForce: false, discard: [], cards,
    });
    const oldCard = { id: 'SOR#010', zone: 'ground', damage: 0, exhausted: false, upgrades: [], shields: 0, experience: 0, statusTokens: {} };
    const events = [{
        seq: 'R1.start', t: 'ROUND_START', round: 1,
        keyframe: { round: 1, phase: 'action', initiative: 1, players: { 1: seat(1, [oldCard]), 2: seat(2, []) } },
    }] as any;

    // Value: protects=a keyframe card from a file older than `captured` folds to a card with `captured: []`, the shape every other card has; fails_when=snapTo copies the card as-is and consumers find captured undefined; why_new=R3 only checked a present captured; seam=none; no_claim=none
    it('gives a keyframe card without captured an empty list, in fold and in checkKeyframes', function () {
        expect(fold(events).players[1]?.cards[0]?.captured).toEqual([]);
        // The first keyframe is compared against an empty board, so only the second is about this.
        const later = checkKeyframes([...events, { seq: 'R1.end', t: 'ROUND_END', round: 1, keyframe: events[0].keyframe }]).mismatches
            .filter((m) => m.seq === 'R1.end');
        expect(later).toEqual([]);
    });
});

describe('fold attachment list cap', function () {
    // Value: protects=a host's upgrades and a captor's captured stop at the cap like every other list the fold grows (spec §12); fails_when=attachTo or CAPTURE push without the cap and a crafted file grows them without bound; why_new=the cap tests above grow zone lists only; seam=none; no_claim=no real game approaches the cap
    it('caps a host\'s upgrades and a captor\'s captives at 1000', function () {
        const events: any[] = [{ seq: 'R1.A.1', t: 'MOVE', card: 'SOR#010', from: 'hand', to: 'ground', p: 1, kind: 'unit' }];
        for (let i = 0; i < 1005; i++) {
            events.push({ seq: `R1.A.2u${i}`, t: 'MOVE', card: `LOF#${i}`, from: 'hand', to: 'ground', p: 1, kind: 'upgrade', attachedTo: 'SOR#010' });
            events.push({ seq: `R1.A.2c${i}`, t: 'CAPTURE', p: 1, card: `SOR#${2000 + i}`, by: 'SOR#010' });
        }
        const host = fold(events).players[1]?.cards.find((c) => c.id === 'SOR#010');
        expect(host?.upgrades.length).toBe(1000);
        expect(host?.captured.length).toBe(1000);
    });
});

describe('fold record order', function () {
    // Value: protects=`for`, not file position, is what ties a record to its action (spec §9.1 [W-18]); fails_when=the fold depends on a writer emitting an action's records before announcing it; why_new=every vector comes from one writer, which always emits them first; seam=none; no_claim=records with no `for`
    it('folds the same when a writer announces the action before its records', function () {
        const vectors = path.resolve(__dirname, '../../../../swupgn/test-vectors');
        const events = parse(fs.readFileSync(path.join(vectors, 'arrest.swupgn'), 'utf8')).events;

        /** Move every record filed `for` the action to sit right after it, keeping seq and `for`. */
        const announceFirst = (list: GameEvent[], action: string): GameEvent[] => {
            const owned = list.filter((e) => e.for === action);
            const rest = list.filter((e) => e.for !== action);
            const at = rest.findIndex((e) => e.seq === action);
            return [...rest.slice(0, at + 1), ...owned, ...rest.slice(at + 1)];
        };
        // R1.A.1 is a PLAY whose resources, MOVE into the arena, STATS and entering EXHAUST all
        // come first; R2.A.3 is an ATTACK whose target CHOICE and EXHAUST do.
        expect(events.filter((e) => e.for === 'R1.A.1').map((e) => e.t))
            .toEqual(['EXHAUST_RESOURCES', 'MOVE', 'STATS', 'EXHAUST']);
        expect(events.filter((e) => e.for === 'R2.A.3').map((e) => e.t))
            .toEqual(['CHOICE', 'EXHAUST']);
        const reordered = announceFirst(announceFirst(events, 'R1.A.1'), 'R2.A.3');
        expect(reordered.map((e) => e.seq)).not.toEqual(events.map((e) => e.seq));

        // The board once the action is done, before the next one, and at the end of the file.
        const plain = (x: unknown) => JSON.parse(JSON.stringify(x));
        expect(plain(stateAt(reordered, 'R1.A.2'))).toEqual(plain(stateAt(events, 'R1.A.2')));
        expect(plain(stateAt(reordered, 'R2.A.4'))).toEqual(plain(stateAt(events, 'R2.A.4')));
        const expected = JSON.parse(fs.readFileSync(path.join(vectors, 'arrest.fold.json'), 'utf8'));
        expect(plain(fold(reordered))).toEqual(expected);
    });
});

describe('fold undeploy', function () {
    const plain = (x: unknown) => JSON.parse(JSON.stringify(x));

    // Value: protects=a MOVE out of an arena folds the same whether or not it carries kind (spec 6.5), so a writer need not guess; fails_when=the fold starts reading kind on a move that leaves an arena; why_new=no vector holds an undeploy move; seam=none; no_claim=what the fold does with a kind that disagrees with the card
    it('folds an undeploy move the same with or without kind', function () {
        const vectors = path.resolve(__dirname, '../../../../swupgn/test-vectors');
        const events = parse(fs.readFileSync(path.join(vectors, 'death-star.swupgn'), 'utf8')).events;
        const withKind = events.map((e): GameEvent => {
            const toBase = e.t === 'MOVE' && (e.from === 'ground' || e.from === 'space') && e.to === 'base';
            return toBase ? { ...e, kind: 'unit' } : e;
        });
        expect(plain(fold(withKind))).toEqual(plain(fold(events)));

        // The death-star vector holds no undeploy, so pin the same property on a board that does.
        const board: GameEvent[] = [
            ev({ seq: 'R1.A.1', t: 'MOVE', p: 1, card: 'SOR#108', from: 'hand', to: 'ground', kind: 'unit' }),
            ev({ seq: 'R1.A.2', t: 'MOVE', p: 1, card: 'SOR#108', from: 'ground', to: 'base' }),
        ];
        const board2: GameEvent[] = [
            board[0],
            ev({ seq: 'R1.A.2', t: 'MOVE', p: 1, card: 'SOR#108', from: 'ground', to: 'base', kind: 'unit' }),
        ];
        expect(plain(fold(board2))).toEqual(plain(fold(board)));
    });
});
