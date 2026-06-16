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

    it('DRAW adds to hand size and known hand', function () {
        const s = fold([{ seq: 'R1.S.1', t: 'DRAW', p: 1, count: 2, cards: ['SOR#108', 'SOR#142'] }] as any);
        expect(s.players[1]!.handSize).toBe(2);
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
    it('RESOURCE moves a card from hand to resources', function () {
        const s = fold([
            { seq: 'R1.S.1', t: 'DRAW', p: 1, count: 1, cards: ['SOR#142'] },
            { seq: 'R1.S.2', t: 'RESOURCE', p: 1, card: 'SOR#142' },
        ] as any);
        expect(s.players[1]!.handSize).toBe(0);
        expect(s.players[1]!.resourcesReady).toBe(1);
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
