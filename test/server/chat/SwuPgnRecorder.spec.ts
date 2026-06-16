import { buildHeader, SwuPgnRecorder } from '../../../server/game/core/chat/SwuPgnRecorder';
import { saltedPlayerId } from '../../../server/game/core/chat/swuPgnIdentity';
import { fold } from '../../../swupgn/src/index';
import type { GameEvent } from '../../../swupgn/src/types';
import { EventName } from '../../../server/game/core/Constants';

describe('SwuPgnRecorder.buildHeader', function () {
    const ctx = {
        gameId: 'game-xyz',
        date: '2026-06-16T12:00:00Z',
        format: 'Premier',
        cardPool: 'SOR',
        engineVersion: 'forceteki@test',
        seed: 'seed-1',
        perspective: null as null | 'P1' | 'P2',
        rounds: 4,
        result: 'P1' as const,
        reason: 'BaseDestroyed',
        p1: { username: 'alice', leader: 'SOR#010', base: 'SOR#028' },
        p2: { username: 'bob', leader: 'SOR#005', base: 'SOR#020' },
    };

    it('emits a 1.1 header with provenance and salted ids', function () {
        const h = buildHeader(ctx);
        expect(h.game).toBe('SWU-PGN/1.1');
        expect(h.cardPool).toBe('SOR');
        expect(h.engine).toBe('forceteki@test');
        expect(h.seed).toBe('seed-1');
        expect(h.rounds).toBe(4);
        expect(h.result).toBe('P1');
    });

    it('never leaks real usernames; uses salted ids + anonymized labels', function () {
        const h = buildHeader(ctx);
        expect(h.p1).toBe('Player 1');
        expect(h.p2).toBe('Player 2');
        expect(h.p1Id).toBe(saltedPlayerId('alice', 'game-xyz'));
        expect(h.p2Id).toBe(saltedPlayerId('bob', 'game-xyz'));
        expect(JSON.stringify(h)).not.toContain('alice');
        expect(JSON.stringify(h)).not.toContain('bob');
    });
});

class FakeEmitter {
    private handlers = new Map<string, ((e: any) => void)[]>();
    public roundNumber = 1;
    public currentPhase = '';
    public on(name: string, fn: (e: any) => void) {
        const l = this.handlers.get(name) ?? [];
        l.push(fn);
        this.handlers.set(name, l);
    }

    public emit(name: string, e: any) {
        for (const fn of this.handlers.get(name) ?? []) {
            fn(e);
        }
    }
}

// Minimal fake engine card. `cardId` resolver maps uuid -> stable id; here uuid === id.
function fakeCard(opts: { uuid: string; zoneName?: string; remainingHp?: number; owner?: any; controller?: any; printedType?: string; isBase?: boolean; title?: string }) {
    return {
        uuid: opts.uuid,
        zoneName: opts.zoneName ?? '',
        remainingHp: opts.remainingHp ?? 0,
        owner: opts.owner,
        controller: opts.controller ?? opts.owner,
        printedType: opts.printedType ?? 'unit',
        title: opts.title ?? opts.uuid,
        isBase: () => opts.isBase === true,
    };
}

const resolver = {
    cardId: (u: string) => u,
    seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2,
};

describe('SwuPgnRecorder events fold to expected state', function () {
    it('PLAY then ATTACK->base + DAMAGE + EXHAUST folds correctly', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, resolver);

        const p1 = { id: 'p1' };
        const p2 = { id: 'p2' };
        const base2 = fakeCard({ uuid: 'SOR#020', isBase: true, owner: p2, remainingHp: 28 });
        const unit = fakeCard({ uuid: 'SOR#108', zoneName: 'groundArena', owner: p1, printedType: 'unit', remainingHp: 5 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        game.emit(EventName.OnAttackDeclared, {
            attack: {
                attacker: unit,
                attackingPlayer: p1,
                getAllTargets: () => [base2],
            },
        });
        game.emit(EventName.OnDamageDealt, {
            card: base2,
            damageSource: { attack: { attacker: unit } },
            damageDealt: 2,
            type: 'combat',
        });
        game.emit(EventName.OnCardExhausted, { card: unit });

        const events = rec.getEvents() as GameEvent[];
        const s = fold(events);
        expect(s.players[2]!.baseHp).toBe(28);
        const card = s.players[1]!.cards.find((c) => c.id === 'SOR#108');
        expect(card!.zone).toBe('groundArena');
        expect(card!.exhausted).toBe(true);
    });

    it('DRAW + RESOURCE adjust hand/resources and DEFEAT moves a card to discard', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, resolver);

        const p1 = { id: 'p1' };
        const drawn = [
            fakeCard({ uuid: 'SOR#100', owner: p1 }),
            fakeCard({ uuid: 'SOR#101', owner: p1 }),
        ];
        const resourced = fakeCard({ uuid: 'SOR#102', owner: p1, title: 'Battlefield Marine' });
        const unit = fakeCard({ uuid: 'SOR#108', zoneName: 'groundArena', owner: p1 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardsDrawn, { player: p1, cards: drawn, amount: 2 });
        game.emit(EventName.OnCardResourced, { card: resourced, resourceControllingPlayer: p1 });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        game.emit(EventName.OnCardDefeated, { card: unit, defeatSource: { type: 'ability' } });

        const events = rec.getEvents() as GameEvent[];
        const s = fold(events);
        const ps = s.players[1]!;
        // drew 2, resourced 1 (hand -1, resourcesReady +1)
        expect(ps.handSize).toBe(1);
        expect(ps.resourcesReady).toBe(1);
        // unit was played then defeated -> in discard, not in play
        expect(ps.cards.find((c) => c.id === 'SOR#108')).toBeUndefined();
        expect(ps.discard).toContain('SOR#108');
    });
});
