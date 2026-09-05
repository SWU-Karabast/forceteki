import { fold, stateAt } from '../../../swupgn/src/fold';
import type { GameEvent } from '../../../swupgn/src/types';

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
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')!.zone).toBe('ground');
    });

    it('applies damage to a base via remaining hp delta', function () {
        const s = fold(events);
        expect(s.players[2]?.baseHp).toBe(28);
    });

    it('marks the attacker exhausted', function () {
        const s = fold(events);
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(true);
    });

    it('stateAt stops at the given seq (exclusive of later events)', function () {
        const s = stateAt(events, 'R1.A.1');
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(false);
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
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#010')!.zone).toBe('ground');
        expect(s.players[2]?.cards.find((c) => c.id === 'TOKEN:X-Wing')!.zone).toBe('space');
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
        const c = s.players[1]?.cards.find((x) => x.id === 'SOR#108')!;
        expect(c.damage).toBe(2);
        expect(c.zone).toBe('space');
        expect(c.shields).toBe(1);
        expect(c.experience).toBe(2);
        expect(c.statusTokens.stun).toBe(1);
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
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')!.shields).toBe(1);
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
        expect(s.players[1]?.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(false);
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
        const paid = fold([...two, { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 }] as any).players[1]!;
        expect([paid.resourcesReady, paid.resourcesExhausted]).toEqual([1, 2]);
        const readied = fold([
            ...two,
            { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 2 },
            { seq: 'R1.G.1', t: 'READY_RESOURCES', p: 1, amount: 1 },
            { seq: 'R1.G.2', t: 'READY_RESOURCES', p: 1, amount: 1 },
            // A record for a resource that was already ready (a writer may emit one) finds
            // nothing exhausted and does nothing.
            { seq: 'R1.G.3', t: 'READY_RESOURCES', p: 1, amount: 1 },
        ] as any).players[1]!;
        expect([readied.resourcesReady, readied.resourcesExhausted]).toEqual([3, 0]);
    });

    it('clamps to what the row holds, exactly as the engine exhausts min(amount, ready)', function () {
        const p = fold([...two, { seq: 'R1.A.0a', t: 'EXHAUST_RESOURCES', p: 1, amount: 5 }] as any).players[1]!;
        expect([p.resourcesReady, p.resourcesExhausted]).toEqual([0, 3]);
        const q = fold([{ seq: 'R1.A.0a', t: 'READY_RESOURCES', p: 1, amount: 5 }] as any).players[1]!;
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
        ] as any).players[1]!;
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
        expect(s.players[1]?.discard).toEqual([]);   // an upgrade was never an arena card, so DEFEAT files nothing
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

    it('a CAPTURE without `by` (or with a base captor) still takes the card off the board', function () {
        const s = fold([...board, { seq: 'R1.A.2b', t: 'CAPTURE', p: 1, card: 'SOR#095:2', by: 'base@1' }] as any);
        expect(s.players[2]?.cards).toEqual([]);
        expect(s.players[1]?.cards[0].captured).toEqual([]);
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
        const p = fold(events).players[1]!;
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

            const p1 = fold(events).players[1]!;

            expect(p1.cards.find((c) => c.id === 'SOR#108')!.zone).toBe('discard');
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
