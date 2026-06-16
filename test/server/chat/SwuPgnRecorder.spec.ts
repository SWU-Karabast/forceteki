import { buildHeader, SwuPgnRecorder } from '../../../server/game/core/chat/SwuPgnRecorder';
import { saltedPlayerId } from '../../../server/game/core/chat/swuPgnIdentity';
import { fold } from '../../../swupgn/src/index';
import type { GameEvent, ReducedState } from '../../../swupgn/src/types';
import { checkKeyframes } from '../../../swupgn/src/integrity';
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
function fakeCard(opts: { uuid: string; zoneName?: string; remainingHp?: number; owner?: any; controller?: any; printedType?: string; isBase?: boolean; isShield?: boolean; isExperience?: boolean; isAdvantage?: boolean; title?: string }) {
    return {
        uuid: opts.uuid,
        zoneName: opts.zoneName ?? '',
        remainingHp: opts.remainingHp ?? 0,
        owner: opts.owner,
        controller: opts.controller ?? opts.owner,
        printedType: opts.printedType ?? 'unit',
        title: opts.title ?? opts.uuid,
        isBase: () => opts.isBase === true,
        isShield: () => opts.isShield === true,
        isExperience: () => opts.isExperience === true,
        isAdvantage: () => opts.isAdvantage === true,
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
        expect(card!.zone).toBe('ground');
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

describe('SwuPgnRecorder gap events: board mutations', function () {
    it('MOVE changes a card zone; SHIELD_GAIN/USE adjust shields; OVERWHELM hits base', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const p2 = { id: 'p2' };
        const base2 = fakeCard({ uuid: 'SOR#020', isBase: true, owner: p2, remainingHp: 30 });
        const unit = fakeCard({ uuid: 'SOR#200', zoneName: 'groundArena', owner: p1, printedType: 'unit', remainingHp: 5 });
        const shieldToken = fakeCard({ uuid: 'SHIELDTOK', owner: p1, isShield: true, printedType: 'token' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // Card must exist in fold state, so play it to ground first.
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });

        // MOVE: ground -> space (real OnCardMoved payload shape).
        unit.zoneName = 'spaceArena';
        game.emit(EventName.OnCardMoved, { card: unit, originalZone: 'groundArena', newZone: 'spaceArena' });

        // SHIELD_GAIN: a Shield token upgrade is attached to the unit (real OnUpgradeAttached shape).
        game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: shieldToken, originalZone: 'outsideTheGame' });

        // SHIELD_USE: the Shield token is defeated to prevent damage (real OnCardDefeated shape).
        game.emit(EventName.OnCardDefeated, { card: shieldToken, defeatSource: { type: 'ability' } });

        // OVERWHELM: overwhelm-typed combat damage rolls onto the defending base. The engine
        // applies the damage (base 30 -> remaining 27) before emitting OnDamageDealt.
        base2.remainingHp = 27;
        game.emit(EventName.OnDamageDealt, {
            card: base2,
            damageSource: { attack: { attacker: unit } },
            damageDealt: 3,
            type: 'overwhelm',
        });

        const events = rec.getEvents() as GameEvent[];
        const s = fold(events);
        const card = s.players[1]!.cards.find((c) => c.id === 'SOR#200');
        expect(card!.zone).toBe('space');        // MOVE normalized to 'space'
        expect(card!.shields).toBe(0);           // +1 then -1
        expect(s.players[2]!.baseHp).toBe(27);   // OVERWHELM (or overwhelm-damage) snapped base
    });
});

describe('SwuPgnRecorder gap events: counters + upgrades', function () {
    it('EXPERIENCE_GAIN and STATUS_TOKEN accumulate on a card', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#300', zoneName: 'groundArena', owner: p1, printedType: 'unit', remainingHp: 5 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // Card must exist in fold state, so play it to ground first.
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });

        // EXPERIENCE_GAIN: experience is a token upgrade (like shields). The engine generates
        // an Experience token-upgrade and attaches it via OnUpgradeAttached (one event per token).
        // +2 experience = two attach events.
        const exp1 = fakeCard({ uuid: 'EXPTOK1', owner: p1, isExperience: true, printedType: 'token' });
        const exp2 = fakeCard({ uuid: 'EXPTOK2', owner: p1, isExperience: true, printedType: 'token' });
        game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: exp1, originalZone: 'outsideTheGame' });
        game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: exp2, originalZone: 'outsideTheGame' });

        // STATUS_TOKEN: +1 advantage status token on the same card. Shield/experience are
        // disambiguated into their own events (SHIELD_GAIN / EXPERIENCE_GAIN); 'advantage' is
        // the other token-upgrade and surfaces as a generic STATUS_TOKEN.
        const advTok = fakeCard({ uuid: 'ADVTOK1', owner: p1, isAdvantage: true, printedType: 'token' });
        game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: advTok, originalZone: 'outsideTheGame' });

        const events = rec.getEvents() as GameEvent[];
        const s = fold(events);
        const card = s.players[1]!.cards.find((c) => c.id === 'SOR#300');
        expect(card!.experience).toBe(2);
        expect(card!.statusTokens['advantage']).toBe(1);
    });

    it('records MULLIGAN/KEEP_HAND and a MODAL_CHOICE with offered/chose', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const p2 = { id: 'p2' };

        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });
        // Real OnMulliganDecision payload shape (engine-side emit at MulliganPrompt.menuCommand).
        game.emit(EventName.OnMulliganDecision, { player: p1, mulligan: true });
        game.emit(EventName.OnMulliganDecision, { player: p2, mulligan: false });
        // Real OnModalChoice payload shape (engine-side emit at HandlerMenuPrompt.menuCommand):
        // a fixed menu/button choice with the offered option list and the chosen index.
        game.emit(EventName.OnModalChoice, { player: p1, offered: ['Draw a card', 'Deal 1 damage'], chose: 1 });

        const events = rec.getEvents();
        expect(events.some((e: any) => e.t === 'MULLIGAN' && e.p === 1)).toBe(true);
        expect(events.some((e: any) => e.t === 'KEEP_HAND' && e.p === 2)).toBe(true);
        const choice = events.find((e: any) => e.t === 'MODAL_CHOICE');
        expect(choice).toBeDefined();
        expect(Array.isArray((choice as any).offered)).toBe(true);
        expect((choice as any).offered).toEqual(['Draw a card', 'Deal 1 damage']);
        expect(typeof (choice as any).chose).toBe('number');
        expect((choice as any).chose).toBe(1);
        expect((choice as any).p).toBe(1);
    });

    it('does not record a MODAL_CHOICE for a pgnLog:false (system) prompt — no emit, no record', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };

        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });
        // HandlerMenuPrompt gates the OnModalChoice emit behind `pgnLog !== false`. A system prompt
        // (e.g. UndoConfirmationPrompt) sets pgnLog:false, so it emits nothing — the recorder, which
        // only listens for OnModalChoice, therefore produces no MODAL_CHOICE record.
        const events = rec.getEvents();
        expect(events.some((e: any) => e.t === 'MODAL_CHOICE')).toBe(false);
    });

    it('skips a malformed MODAL_CHOICE when chose is not a number', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };

        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });
        game.emit(EventName.OnModalChoice, { player: p1, offered: ['A', 'B'], chose: undefined });

        const events = rec.getEvents();
        expect(events.some((e: any) => e.t === 'MODAL_CHOICE')).toBe(false);
    });

    it('records an ABILITY_ACTIVATE event', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#300', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // Real OnCardAbilityInitiated payload shape: { card, ability }.
        game.emit(EventName.OnCardAbilityInitiated, { card: unit, ability: { abilityIdentifier: 'SOR#300_action' } });

        const events = rec.getEvents() as GameEvent[];
        const rec1 = events.find((e) => e.t === 'ABILITY_ACTIVATE');
        expect(rec1).toBeDefined();
        expect((rec1 as any).card).toBe('SOR#300');
        expect((rec1 as any).p).toBe(1);
        expect((rec1 as any).ability).toBe('SOR#300_action');
    });
});

describe('SwuPgnRecorder keyframes + INIT', function () {
    it('embeds a ReducedState keyframe on ROUND_START and records INIT deck order', function () {
        const game = new FakeEmitter();
        const reducedFromEngine = (round: number): ReducedState => ({
            round, phase: 'setup', initiative: null,
            players: {
                1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 6, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 6, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
            },
        });
        const rec = new SwuPgnRecorder(game as any, {
            cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2),
            reducedState: (round: number) => reducedFromEngine(round),
            deckOrder: () => ({ p1: ['SOR#108', 'SOR#200'], p2: ['SOR#045'] }),
        });
        rec.recordInit();
        // The recorder syncs rounds in syncRound(), driven by game.roundNumber from
        // OnPhaseStarted (OnBeginRound doesn't reach listeners). roundNumber === 1 > the
        // recorder's initial currentRound (0), so this emits ROUND_START once with the keyframe.
        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });

        const setup = rec.getSetup();
        expect(setup[0].t).toBe('INIT');
        expect((setup[0] as any).p1DeckOrder).toEqual(['SOR#108', 'SOR#200']);

        const events = rec.getEvents();
        const rs = events.find((e: any) => e.t === 'ROUND_START');
        expect(rs).toBeDefined();
        expect((rs as any).keyframe).toBeDefined();
        expect((rs as any).keyframe.players[1].baseHp).toBe(30);
        // a keyframe with no preceding deltas must pass checkKeyframes (fold == keyframe)
        expect(checkKeyframes(events).ok).toBe(true);
    });
});
