import { fold, stateAt } from '../../../swupgn/src/fold';
import type { GameEvent } from '../../../swupgn/src/types';

function ev(e: GameEvent): GameEvent { return e; }

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
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#108')!.zone).toBe('ground');
    });

    it('applies damage to a base via remaining hp delta', function () {
        const s = fold(events);
        expect(s.players[2]!.baseHp).toBe(28);
    });

    it('marks the attacker exhausted', function () {
        const s = fold(events);
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(true);
    });

    it('stateAt stops at the given seq (exclusive of later events)', function () {
        const s = stateAt(events, 'R1.A.1');
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(false);
    });
});

describe('fold additional events', function () {
    it('PLAY_EVENT goes to discard, not into play', function () {
        const s = fold([{ seq: 'R1.A.1', t: 'PLAY_EVENT', p: 1, card: 'SOR#142' }] as any);
        expect(s.players[1]!.cards.length).toBe(0);
        expect(s.players[1]!.discard).toContain('SOR#142');
    });

    it('PLAY_UPGRADE attaches to its host unit', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'PLAY_UPGRADE', p: 1, card: 'SOR#200', target: 'SOR#108' },
        ] as any);
        expect(s.players[1]!.cards.length).toBe(1);
        expect(s.players[1]!.cards[0].upgrades).toContain('SOR#200');
    });

    it('DEFEAT moves a card from play to discard', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 2, card: 'SOR#045', zone: 'ground' },
            { seq: 'R1.A.2', t: 'DEFEAT', card: 'SOR#045', reason: 'no_remaining_hp' },
        ] as any);
        expect(s.players[2]!.cards.length).toBe(0);
        expect(s.players[2]!.discard).toContain('SOR#045');
    });

    it('DRAW records the known hand contents (handSize is driven by MOVE, the engine source of truth)', function () {
        const s = fold([{ seq: 'R1.S.1', t: 'DRAW', p: 1, count: 2, cards: ['SOR#108', 'SOR#142'] }] as any);
        // DRAW no longer mutates handSize: in real streams every drawn card also produces a
        // deck->hand MOVE, and counting both would double-count vs the keyframe.
        expect(s.players[1]!.handSize).toBe(0);
        expect(s.players[1]!.hand).toEqual(['SOR#108', 'SOR#142']);
    });

    it('stateAt with a nonexistent seq folds the whole log', function () {
        const events = [{ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' }] as any;
        const s = stateAt(events, 'R9.Z.9');
        expect(s.players[1]!.cards.length).toBe(1);
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
        expect(s.players[1]!.baseHp).toBe(25);
        expect(s.players[2]!.baseHp).toBe(15);
    });
});

describe('fold event coverage', function () {
    it('MOVE drives handSize and resourcesReady (deck->hand, then hand->resource)', function () {
        const s = fold([
            { seq: 'R1.S.1', t: 'MOVE', p: 1, card: 'SOR#142', from: 'deck', to: 'hand' },
            { seq: 'R1.S.2', t: 'MOVE', p: 1, card: 'SOR#108', from: 'deck', to: 'hand' },
            { seq: 'R1.S.3', t: 'MOVE', p: 1, card: 'SOR#142', from: 'hand', to: 'resource' },
        ] as any);
        expect(s.players[1]!.handSize).toBe(1);
        expect(s.players[1]!.resourcesReady).toBe(1);
    });

    it('MOVE places an arena card on entry and removes it on exit (idempotent by id)', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'MOVE', p: 2, card: 'SOR#095', from: 'outsideTheGame', to: 'ground' },
            // A redundant MOVE for an already-tracked card must not duplicate it.
            { seq: 'R1.A.2', t: 'MOVE', p: 2, card: 'SOR#095', from: 'ground', to: 'ground' },
        ] as any);
        expect(s.players[2]!.cards.filter((c) => c.id === 'SOR#095').length).toBe(1);
        const s2 = fold([
            { seq: 'R1.A.1', t: 'MOVE', p: 2, card: 'SOR#095', from: 'outsideTheGame', to: 'ground' },
            { seq: 'R1.A.2', t: 'MOVE', p: 2, card: 'SOR#095', from: 'ground', to: 'discard' },
        ] as any);
        expect(s2.players[2]!.cards.find((c) => c.id === 'SOR#095')).toBeUndefined();
    });

    it('PLAY then a coinciding hand->ground MOVE does not double-add the card', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.1a', t: 'MOVE', p: 1, card: 'SOR#108', from: 'hand', to: 'ground' },
        ] as any);
        expect(s.players[1]!.cards.filter((c) => c.id === 'SOR#108').length).toBe(1);
    });

    it('DEPLOY_LEADER and CREATE_TOKEN add cards to play', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'DEPLOY_LEADER', p: 1, card: 'SOR#010', zone: 'ground' },
            { seq: 'R1.A.2', t: 'CREATE_TOKEN', p: 2, token: 'TOKEN:X-Wing', zone: 'space' },
        ] as any);
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#010')!.zone).toBe('ground');
        expect(s.players[2]!.cards.find((c) => c.id === 'TOKEN:X-Wing')!.zone).toBe('space');
    });

    it('OVERWHELM sets the defender base hp', function () {
        const s = fold([{ seq: 'R1.A.1b', t: 'OVERWHELM', p: 1, tgt: 'base@2', amt: 4, hp: 16 }] as any);
        expect(s.players[2]!.baseHp).toBe(16);
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
        const c = s.players[1]!.cards.find((x) => x.id === 'SOR#108')!;
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
        const clones = s.players[1]!.cards.filter((c) => c.id === 'TOKEN:Clone');
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
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#108')!.shields).toBe(1);
    });

    it('HEAL on a base raises baseHp to the reported value', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'DAMAGE', src: 'X', tgt: 'base@2', amt: 10, damageType: 'combat', hp: 20 },
            { seq: 'R1.A.2', t: 'HEAL', tgt: 'base@2', amt: 4, hp: 24 },
        ] as any);
        expect(s.players[2]!.baseHp).toBe(24);
    });

    it('READY clears the exhausted flag set by EXHAUST', function () {
        const s = fold([
            { seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' },
            { seq: 'R1.A.2', t: 'EXHAUST', card: 'SOR#108' },
            { seq: 'R1.A.3', t: 'READY', card: 'SOR#108' },
        ] as any);
        expect(s.players[1]!.cards.find((c) => c.id === 'SOR#108')!.exhausted).toBe(false);
    });

    it('pure-log events (CAPTURE/RESCUE/TAKE_CONTROL) leave the board unchanged', function () {
        const base = [{ seq: 'R1.A.1', t: 'PLAY', p: 1, card: 'SOR#108', zone: 'ground' }];
        const before = JSON.stringify(fold(base as any).players[1]!.cards);
        const after = fold([
            ...base,
            { seq: 'R1.A.2', t: 'CAPTURE', p: 2, card: 'SOR#108' },
            { seq: 'R1.A.3', t: 'RESCUE', p: 1, card: 'SOR#108' },
            { seq: 'R1.A.4', t: 'TAKE_CONTROL', p: 2, card: 'SOR#108' },
        ] as any).players[1]!.cards;
        expect(JSON.stringify(after)).toBe(before);
    });
});
