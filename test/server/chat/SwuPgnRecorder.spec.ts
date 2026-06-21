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
function fakeCard(opts: { uuid: string; zoneName?: string; remainingHp?: number; owner?: any; controller?: any; printedType?: string; isBase?: boolean; isShield?: boolean; isExperience?: boolean; isAdvantage?: boolean; title?: string; cost?: number }) {
    return {
        uuid: opts.uuid,
        zoneName: opts.zoneName ?? '',
        remainingHp: opts.remainingHp ?? 0,
        owner: opts.owner,
        controller: opts.controller ?? opts.owner,
        printedType: opts.printedType ?? 'unit',
        title: opts.title ?? opts.uuid,
        cost: opts.cost,
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
        // The engine performs every zone transition as an OnCardMoved (which the recorder maps
        // to a MOVE) and ALSO emits the higher-level summary events (OnCardsDrawn/Resourced).
        // The 1.1 fold reconstructs handSize/resourcesReady from MOVE (the source of truth), so
        // we emit both here exactly as the engine would.
        game.emit(EventName.OnCardMoved, { card: drawn[0], originalZone: 'deck', newZone: 'hand' });
        game.emit(EventName.OnCardMoved, { card: drawn[1], originalZone: 'deck', newZone: 'hand' });
        game.emit(EventName.OnCardsDrawn, { player: p1, cards: drawn, amount: 2 });
        game.emit(EventName.OnCardMoved, { card: resourced, originalZone: 'hand', newZone: 'resource' });
        game.emit(EventName.OnCardResourced, { card: resourced, resourceControllingPlayer: p1 });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        game.emit(EventName.OnCardDefeated, { card: unit, defeatSource: { type: 'ability' } });
        game.emit(EventName.OnCardMoved, { card: unit, originalZone: 'groundArena', newZone: 'discard' });

        const events = rec.getEvents() as GameEvent[];
        const s = fold(events);
        const ps = s.players[1]!;
        // drew 2 (hand +2), resourced 1 (hand -1, resourcesReady +1) -> hand 1, resources 1
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

describe('SwuPgnRecorder: token creation and play cost', function () {
    it('emits CREATE_TOKEN only for unit tokens, with a stable idOf (skips upgrade/credit tokens)', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const cloneToken = { uuid: 'TOKEN:Clone', owner: p1, controller: p1, zoneName: 'groundArena', isUnit: () => true, getPower: () => 0, getHp: () => 0 };
        const shieldToken = { uuid: 'shield-1', owner: p1, controller: p1, isUnit: () => false };

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnTokensCreated, { generatedTokens: [cloneToken, shieldToken] });

        const creates = rec.getEvents().filter((e: any) => e.t === 'CREATE_TOKEN');
        expect(creates.length).toBe(1);                        // only the unit token
        expect((creates[0] as any).token).toBe('TOKEN:Clone'); // stable id, consistent with later refs
        expect((creates[0] as any).zone).toBe('ground');
    });

    it('records the play cost from card.cost (the event has no numeric cost field)', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#108', owner: p1, zoneName: 'groundArena', cost: 3 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // Real OnCardPlayed payload carries `costs` (objects), not a numeric `cost`.
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play', costs: [{}] });

        const play = rec.getEvents().find((e: any) => e.t === 'PLAY');
        expect((play as any).cost).toBe(3);
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

    it('collapses the paired TRIGGER + ABILITY_ACTIVATE for an activated ability into one record', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#300', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // AbilityResolver emits BOTH for one activation; engine order is Triggered then Initiated.
        game.emit(EventName.OnCardAbilityTriggered, { card: unit });
        game.emit(EventName.OnCardAbilityInitiated, { card: unit, ability: { abilityIdentifier: 'SOR#300_action' } });

        const events = rec.getEvents();
        expect(events.filter((e: any) => e.t === 'TRIGGER').length).toBe(0);
        const acts = events.filter((e: any) => e.t === 'ABILITY_ACTIVATE');
        expect(acts.length).toBe(1);
        expect((acts[0] as any).ability).toBe('SOR#300_action');

        // The collapse reuses the trigger's seq slot, so it leaves no gap: a following sub-event
        // is contiguous with the ABILITY_ACTIVATE rather than skipping a seq number.
        game.emit(EventName.OnCardExhausted, { card: unit });
        expect((acts[0] as any).seq).toBe('R1.A.0a');
        expect((events.find((e: any) => e.t === 'EXHAUST') as any).seq).toBe('R1.A.0b');
    });

    it('collapses the pair regardless of emission order (ABILITY_ACTIVATE before TRIGGER)', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#301', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardAbilityInitiated, { card: unit, ability: { abilityIdentifier: 'SOR#301_action' } });
        game.emit(EventName.OnCardAbilityTriggered, { card: unit });

        const events = rec.getEvents();
        expect(events.filter((e: any) => e.t === 'TRIGGER').length).toBe(0);
        expect(events.filter((e: any) => e.t === 'ABILITY_ACTIVATE').length).toBe(1);
    });

    it('records a CHOICE with offered card ids and the chosen index', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const a = fakeCard({ uuid: 'SOR#101', owner: p1, controller: p1 });
        const b = fakeCard({ uuid: 'SOR#102', owner: p1, controller: p1 });
        const c = fakeCard({ uuid: 'SOR#103', owner: p1, controller: p1 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        // Real OnCardSelection payload shape (engine-side emit at SelectCardPrompt.emitCardSelection):
        // the offered candidate cards and the single chosen card.
        game.emit(EventName.OnCardSelection, { player: p1, offered: [a, b, c], chosen: b, prompt: 'Choose a unit' });

        const events = rec.getEvents();
        const choice = events.find((e: any) => e.t === 'CHOICE');
        expect(choice).toBeDefined();
        expect((choice as any).offered).toEqual(['SOR#101', 'SOR#102', 'SOR#103']);
        expect((choice as any).chose).toBe(1);
        expect((choice as any).p).toBe(1);
        expect((choice as any).prompt).toBe('Choose a unit');
    });

    it('skips a CHOICE when the chosen card is unresolvable or absent from the offered pool', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const a = fakeCard({ uuid: 'SOR#101', owner: p1, controller: p1 });
        const stranger = fakeCard({ uuid: 'SOR#999', owner: p1, controller: p1 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardSelection, { player: p1, offered: [a], chosen: stranger });
        game.emit(EventName.OnCardSelection, { player: p1, offered: [a], chosen: undefined });

        expect(rec.getEvents().some((e: any) => e.t === 'CHOICE')).toBe(false);
    });
});

describe('SwuPgnRecorder keyframes + INIT', function () {
    it('embeds a ReducedState keyframe on ROUND_START and records INIT deck order', function () {
        const game = new FakeEmitter();
        const reducedFromEngine = (round: number): ReducedState => ({
            round, phase: 'setup', initiative: null,
            // handSize 0: with no preceding events the empty-state fold has hand 0, so the
            // first keyframe must report 0 for checkKeyframes (fold == keyframe) to hold under
            // the extended diff (which now gates handSize/resourcesReady, not just baseHp).
            players: {
                1: { seat: 1, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
                2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] },
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

describe('SwuPgnRecorder rollback', function () {
    it('truncates events + setup and restores counters/shieldParents to a checkpoint boundary', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unitA = fakeCard({ uuid: 'SOR#400', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit', remainingHp: 5 });
        const unitB = fakeCard({ uuid: 'SOR#401', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit', remainingHp: 5 });

        // Advance to the action phase and emit a couple of events (these are kept).
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unitA, player: p1, playType: 'play' }); // action 1
        game.emit(EventName.OnCardExhausted, { card: unitA });                            // sub-event 1a

        // Snapshot the boundary state for later assertions.
        const boundaryEventsLen = rec.getEvents().length;
        const boundaryAction = (rec as any).actionCounter as number;
        const boundarySub = (rec as any).subEventCounter as number;

        rec.checkpoint(1);

        // Emit MORE events after the checkpoint, including a SHIELD_GAIN (populates shieldParents)
        // and additional sub-events that bump the counters.
        const shieldTok = fakeCard({ uuid: 'SHIELDTOK_POST', owner: p1, isShield: true, printedType: 'token' });
        game.emit(EventName.OnCardPlayed, { card: unitB, player: p1, playType: 'play' });             // action 2
        game.emit(EventName.OnUpgradeAttached, { parentCard: unitB, upgradeCard: shieldTok });        // SHIELD_GAIN (2a)
        game.emit(EventName.OnCardExhausted, { card: unitB });                                         // 2b

        const before = rec.getEvents().length;
        expect(before).toBeGreaterThan(boundaryEventsLen);
        // shieldParents now has the post-checkpoint shield.
        expect((rec as any).shieldParents.has('SHIELDTOK_POST')).toBe(true);
        // counters advanced past the boundary.
        expect((rec as any).actionCounter).toBeGreaterThan(boundaryAction);

        // Roll back to the checkpoint.
        rec.rollbackTo(1);

        // events truncated back to the boundary; post-checkpoint events dropped.
        expect(rec.getEvents().length).toBe(boundaryEventsLen);
        expect(rec.getEvents().some((e: any) => e.card === 'SOR#401')).toBe(false);
        expect(rec.getEvents().some((e: any) => e.t === 'SHIELD_GAIN')).toBe(false);

        // counters restored exactly.
        expect((rec as any).actionCounter).toBe(boundaryAction);
        expect((rec as any).subEventCounter).toBe(boundarySub);

        // shieldParents restored to checkpoint state: the post-checkpoint shield is gone, so a
        // SHIELD_USE for it now finds no parent and is skipped (no SHIELD_USE record emitted).
        expect((rec as any).shieldParents.has('SHIELDTOK_POST')).toBe(false);
        game.emit(EventName.OnCardDefeated, { card: shieldTok, defeatSource: { type: 'ability' } });
        expect(rec.getEvents().some((e: any) => e.t === 'SHIELD_USE')).toBe(false);

        // A subsequently-emitted top-level action uses the next seq consistent with the restored
        // counters (no gap/dupe): the boundary had actionCounter at boundaryAction, so the next
        // action is boundaryAction + 1.
        const unitC = fakeCard({ uuid: 'SOR#402', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit', remainingHp: 5 });
        game.emit(EventName.OnCardPlayed, { card: unitC, player: p1, playType: 'play' });
        const newAction = rec.getEvents().find((e: any) => e.card === 'SOR#402') as any;
        expect(newAction).toBeDefined();
        expect(newAction.seq).toBe(`R1.A.${boundaryAction + 1}`);
    });

    it('is a safe no-op when rolling back to an unknown snapshot id', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#500', zoneName: 'groundArena', owner: p1, printedType: 'unit' });
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        rec.checkpoint(1);
        const len = rec.getEvents().length;

        expect(() => rec.rollbackTo(999)).not.toThrow();
        expect(rec.getEvents().length).toBe(len);
        // rolling back to null is also a safe no-op.
        expect(() => rec.rollbackTo(null)).not.toThrow();
        expect(rec.getEvents().length).toBe(len);
    });
});
