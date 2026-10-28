import { buildHeader, SWU_PGN_WRITER_REVISION, SwuPgnRecorder } from '../../../server/game/core/chat/SwuPgnRecorder';
import { SwuPgn } from '../../../server/game/core/chat/SwuPgn';
import { saltedPlayerId } from '../../../server/game/core/chat/swuPgnIdentity';
import { fold, parse } from '../../../swupgn/src/index';
import type { GameEvent, ReducedState } from '../../../swupgn/src/types';
import { checkKeyframes } from '../../../swupgn/src/integrity';
import { AbilityType, EventName } from '../../../server/game/core/Constants';
import { logger } from '../../../server/logger';

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
        p1: { accountId: 'alice', leader: 'SOR#010', base: 'SOR#028' },
        p2: { accountId: 'bob', leader: 'SOR#005', base: 'SOR#020' },
    };

    it('emits a 1.0 header with provenance and salted ids', function () {
        const h = buildHeader(ctx);
        expect(h.game).toBe('SWU-PGN/1.0');
        expect(h.writerRevision).toBe(SWU_PGN_WRITER_REVISION);
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

    // Spec §17: GameId is opaque. The engine's game id is in the server's logs beside the lobby
    // and the players, so it must not be what a shared replay prints.
    it('writes GameId as a hash of the engine game id, never the id itself', function () {
        const h = buildHeader(ctx);
        expect(h.gameId).toMatch(/^sha256:[0-9a-f]{64}$/);
        expect(JSON.stringify(h)).not.toContain('game-xyz');
        expect(buildHeader({ ...ctx, gameId: 'other-game' }).gameId).not.toBe(h.gameId);
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
function fakeCard(opts: { uuid: string; zoneName?: string; remainingHp?: number; owner?: any; controller?: any; printedType?: string; isBase?: boolean; isShield?: boolean; isExperience?: boolean; isAdvantage?: boolean; isWeakness?: boolean; isToken?: boolean; internalName?: string; title?: string; cost?: number; exhausted?: boolean; exhaustedBeforeMove?: boolean }) {
    const tokenUpgrade = opts.isShield === true || opts.isExperience === true || opts.isAdvantage === true || opts.isWeakness === true;
    return {
        uuid: opts.uuid,
        zoneName: opts.zoneName ?? '',
        remainingHp: opts.remainingHp ?? 0,
        owner: opts.owner,
        controller: opts.controller ?? opts.owner,
        printedType: opts.printedType ?? 'unit',
        title: opts.title ?? opts.uuid,
        // Real token upgrades classify by TYPE plus their internal name (spec §10.1); the
        // predicates below are what the engine exposes for the two named counters.
        internalName: opts.internalName ?? (opts.isAdvantage ? 'advantage' : opts.isWeakness ? 'weakness' : opts.isShield ? 'shield' : opts.isExperience ? 'experience' : undefined),
        cost: opts.cost,
        exhausted: opts.exhausted,
        exhaustedBeforeMove: opts.exhaustedBeforeMove ?? null,
        isBase: () => opts.isBase === true,
        isShield: () => opts.isShield === true,
        isExperience: () => opts.isExperience === true,
        isAdvantage: () => opts.isAdvantage === true,
        isTokenUpgrade: () => tokenUpgrade,
        isToken: () => opts.isToken === true || tokenUpgrade,
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
        expect(s.players[2]?.baseHp).toBe(28);
        const card = s.players[1]?.cards.find((c) => c.id === 'SOR#108');
        expect(card.zone).toBe('ground');
        expect(card.exhausted).toBe(true);
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
        // The 1.0 fold reconstructs handSize/resourcesReady from MOVE (the source of truth), so
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
        const ps = s.players[1];
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
        const card = s.players[1]?.cards.find((c) => c.id === 'SOR#200');
        expect(card.zone).toBe('space');        // MOVE normalized to 'space'
        expect(card.shields).toBe(0);           // +1 then -1
        expect(s.players[2]?.baseHp).toBe(27);   // OVERWHELM (or overwhelm-damage) snapped base
    });
});

describe('SwuPgnRecorder: token creation and play cost', function () {
    it('emits CREATE_TOKEN only for unit tokens, with a stable idOf (skips upgrade/credit tokens)', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        // MODELLED ON THE REAL ENGINE, and this is the whole point of the test. `generateToken`
        // puts a token in `outsideTheGame`, and only a CONTINGENT PutIntoPlaySystem moves it to
        // its arena afterwards. So at OnTokensCreated the token reports `outsideTheGame`, and its
        // live stats -- computed from `upgrades` -- THROW a Contract assertion for that zone.
        // A stub that answered `groundArena` and `getPower: () => 0` kept this test green while
        // the handler threw on every token in production, dropping every CREATE_TOKEN and setting
        // RecorderErrors on any game with a token.
        const outOfPlay = () => {
            // What the engine's Contract actually throws for a stat read in this zone.
            throw new Error('Contract assertion failure: Attempting to read property upgrades ' +
              'on clone-trooper but it is in zone outsideTheGame where the property does not apply');
        };
        const cloneToken = {
            uuid: 'TOKEN:Clone', owner: p1, controller: p1,
            zoneName: 'outsideTheGame', defaultArena: 'groundArena',
            isUnit: () => true, getPower: outOfPlay, getHp: outOfPlay,
        };
        const shieldToken = { uuid: 'shield-1', owner: p1, controller: p1, isUnit: () => false };

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnTokensCreated, { generatedTokens: [cloneToken, shieldToken] });

        const creates = rec.getEvents().filter((e: any) => e.t === 'CREATE_TOKEN');
        expect(creates.length).toBe(1);                        // only the unit token
        expect((creates[0] as any).token).toBe('TOKEN:Clone'); // stable id, consistent with later refs
        // The arena it is ENTERING, not the `outsideTheGame` it is sitting in: a non-arena zone
        // would fold to a phantom card in `cards[]` that no keyframe agrees with.
        expect((creates[0] as any).zone).toBe('ground');
        // Unreadable stats are omitted, not invented -- the STATS record after the token's MOVE
        // carries the real values.
        expect((creates[0] as any).power).toBeUndefined();
        expect((creates[0] as any).hp).toBeUndefined();
        // And above all: the handler did not throw, so nothing was counted into RecorderErrors.
        expect(rec.getErrorCount()).toBe(0);
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
        const card = s.players[1]?.cards.find((c) => c.id === 'SOR#300');
        expect(card.experience).toBe(2);
        expect(card.statusTokens['advantage']).toBe(1);
    });

    // The reported bug: a gained Advantage was emitted as STATUS_TOKEN +1 on attach, but its
    // removal was only ever recorded as the token pseudo-card leaving play (MOVE + DEFEAT) with
    // no decrement — so a reader folding the stream kept the token on its host for the rest of
    // the replay, while the engine's own keyframe reported statusTokens {}.
    it('removes advantage/experience/shield tokens when the token is defeated', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#300', zoneName: 'groundArena', owner: p1, printedType: 'unit', remainingHp: 5 });
        const advTok = fakeCard({ uuid: 'ADVTOK1', owner: p1, isAdvantage: true, printedType: 'token' });
        const expTok = fakeCard({ uuid: 'EXPTOK1', owner: p1, isExperience: true, printedType: 'token' });
        const shieldTok = fakeCard({ uuid: 'SHIELDTOK1', owner: p1, isShield: true, printedType: 'token' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        for (const token of [advTok, expTok, shieldTok]) {
            game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: token, originalZone: 'outsideTheGame' });
        }

        // Each token is removed by being defeated. DefeatCardSystem unattaches it first, so the
        // token's parentCard is already gone — the host comes from the attach-time record.
        for (const token of [advTok, expTok, shieldTok]) {
            game.emit(EventName.OnCardDefeated, { card: token, defeatSource: { type: 'ability' } });
        }

        const events = rec.getEvents() as GameEvent[];
        const removals = events.filter((e: any) => e.count === -1 || e.t === 'SHIELD_USE');
        expect(removals.map((e: any) => e.t).sort()).toEqual(['EXPERIENCE_GAIN', 'SHIELD_USE', 'STATUS_TOKEN']);

        const card = fold(events).players[1]?.cards.find((c) => c.id === 'SOR#300');
        expect(card.experience).toBe(0);
        expect(card.shields).toBe(0);
        // A token that reaches zero is DELETED, not left as {advantage: 0} — the engine
        // keyframe reports a host with no tokens as {}, and the gate compares by JSON equality.
        expect(card.statusTokens).toEqual({});
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

    // A BASE names itself `base@N` on ABILITY_ACTIVATE (spec §6.3) so a reader can tell a base's
    // Epic Action from a leader's. Both halves of the pair must use that same ref, or the collapse
    // silently stops firing for every base ability -- which is exactly the base Epic Action the
    // ref was introduced for. The tests above use a UNIT, so they cannot catch this.
    it('collapses the pair for a BASE ability, whose ref is base@N not SET#NUM', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const base = fakeCard({ uuid: 'SOR#029', zoneName: 'base', owner: p1, controller: p1 });
        (base as any).isBase = () => true;

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardAbilityTriggered, { card: base });
        game.emit(EventName.OnCardAbilityInitiated, { card: base, ability: { abilityIdentifier: 'tarkintown_epic' } });

        const events = rec.getEvents();
        expect(events.filter((e: any) => e.t === 'TRIGGER').length).toBe(0);
        const acts = events.filter((e: any) => e.t === 'ABILITY_ACTIVATE');
        expect(acts.length).toBe(1);
        expect((acts[0] as any).card).toBe('base@1');
    });

    // OnLeaderFlipped is raised by FlipAndAttachPilotLeaderSystem too (Poe Dameron, I Can Fly
    // Anything), for a leader with no second face. Recording that as onStartingSide:false would
    // make a reader show a back side that does not exist.
    it('emits LEADER_FLIP only for a leader that actually has two sides', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });

        const p1 = { id: 'p1' };
        const pilotLeader = fakeCard({ uuid: 'JTL#010', zoneName: 'base', owner: p1, controller: p1 });
        const doubleSided = fakeCard({ uuid: 'TWI#017', zoneName: 'base', owner: p1, controller: p1 });
        (doubleSided as any).isDoubleSidedLeader = () => true;
        (doubleSided as any).onStartingSide = false;

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnLeaderFlipped, { card: pilotLeader });
        game.emit(EventName.OnLeaderFlipped, { card: doubleSided });

        const flips = rec.getEvents().filter((e: any) => e.t === 'LEADER_FLIP');
        expect(flips.length).toBe(1);
        expect((flips[0] as any).card).toBe('TWI#017');
        expect((flips[0] as any).onStartingSide).toBe(false);
        expect(rec.getErrorCount()).toBe(0);
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

describe('SwuPgnRecorder: ROUND_START states the active seat', function () {
    const p1 = { id: 'p1' };
    const p2 = { id: 'p2' };

    it('writes every ROUND_START with active', function () {
        const game: any = new FakeEmitter();
        const rec = new SwuPgnRecorder(game, resolver);
        game.initiativePlayer = p2;
        game.actionPhaseActivePlayer = null; // not yet assigned when the round opens
        game.roundNumber = 1;
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.initiativePlayer = p1;
        game.roundNumber = 2;
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });

        const starts = (rec.getEvents() as any[]).filter((e) => e.t === 'ROUND_START');
        expect(starts.map((e) => [e.round, e.active])).toEqual([[1, 2], [2, 1]]);
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
        // Value: protects=INIT is written as R0.S.0 (spec W-35, writer revision 3); fails_when=the recorder reverts to the revision-1/2 seq R1.S.0; why_new=no spec read the INIT seq the recorder writes, and the vector gate pins only fold and render; seam=none; no_claim=readers still accept R1.S.0
        expect(setup[0].seq).toBe('R0.S.0');
        expect((setup[0] as any).p1DeckOrder).toEqual(['SOR#108', 'SOR#200']);

        const events = rec.getEvents();
        const rs = events.find((e: any) => e.t === 'ROUND_START');
        expect(rs).toBeDefined();
        expect((rs as any).keyframe).toBeDefined();
        expect((rs as any).keyframe.players[1].baseHp).toBe(30);
        // a keyframe with no preceding deltas must pass checkKeyframes (fold == keyframe)
        expect(checkKeyframes(events).ok).toBe(true);
    });

    // A keyframe REPLACES the reader's whole state, so one missing a seat erases that
    // player's board. Dropping the keyframe is strictly safer: the fold just carries on.
    it('omits the keyframe rather than emitting one that is missing a seat', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, {
            cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2),
            reducedState: (round: number): ReducedState => ({
                round, phase: 'setup', initiative: null,
                players: { 2: { seat: 2, baseHp: 30, baseMaxHp: 30, handSize: 0, hand: [], resourcesReady: 0, resourcesExhausted: 0, credits: 0, hasForce: false, discard: [], cards: [] } },
            }),
        });
        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });

        const rs: any = rec.getEvents().find((e: any) => e.t === 'ROUND_START');
        expect(rs).toBeDefined();
        expect(rs.keyframe).toBeUndefined();
    });

    it('omits the keyframe when the projection throws', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, {
            cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2),
            reducedState: () => {
                throw new Error('board projection blew up');
            },
        });
        game.emit(EventName.OnPhaseStarted, { phase: 'setup' });

        const rs: any = rec.getEvents().find((e: any) => e.t === 'ROUND_START');
        expect(rs).toBeDefined();          // the round boundary is still recorded
        expect(rs.keyframe).toBeUndefined();
    });
});

// DEFEAT.reason is a CLOSED set (spec §6.4) and the writer bridges it from the engine's own
// DefeatSourceType. Both ends of that bridge need a test: the mapped values are covered by the
// real-game contract specs, but the fallback is only reachable when the engine hands over a
// defeat with no source at all -- which is exactly the case that used to write an empty string,
// a value outside the enum and outside the schema.
// An event card's ability reached a published export with NO `kind` at all: abilityKind()'s
// switch ended in `default: return undefined`, and AbilityType.Event was never a case. The map
// that replaced it is exhaustive over AbilityType, so this asserts the whole engine vocabulary
// lands somewhere rather than re-testing the one type that escaped.
describe('SwuPgnRecorder classifies every engine ability type', function () {
    it('gives an ABILITY_ACTIVATE a kind for each AbilityType the engine can raise', function () {
        const expected: Record<string, string> = {
            action: 'action',
            triggered: 'triggered',
            replacementEffect: 'replacement',
            damageModification: 'replacement',
            constant: 'constant',
            event: 'event',
            delayedEffect: 'delayed',
        };
        // Every member of the engine enum is covered above; a new one added there without a
        // mapping is already a compile error in the recorder's Record.
        expect(Object.keys(expected).sort()).toEqual(Object.values(AbilityType).sort());

        for (const [engineType, kind] of Object.entries(expected)) {
            const game = new FakeEmitter();
            const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: () => 1 as const });
            game.emit(EventName.OnPhaseStarted, { phase: 'action' });
            const p1 = { id: 'p1' };
            const card = fakeCard({ uuid: `SOR#${engineType}`, zoneName: 'groundArena', owner: p1, controller: p1 });
            game.emit(EventName.OnCardAbilityInitiated, {
                card,
                // The shape an event card's ability actually has: no explicit identifier, so
                // CardAbility falls back to `<internalName>_anonymous`.
                ability: { type: engineType, abilityIdentifier: 'some-card_anonymous', getTitle: () => 'T' },
            });
            const act = rec.getEvents().find((e: any) => e.t === 'ABILITY_ACTIVATE') as any;
            expect(act).withContext(`${engineType} produced no record`)
                .toBeDefined();
            expect(act.kind).withContext(`${engineType} -> kind`)
                .toBe(kind);
        }
    });
});

describe('SwuPgnRecorder closed-vocabulary fallbacks', function () {
    const recorder = () => {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: () => 1 as const });
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        return { game, rec };
    };

    it('writes DEFEAT.reason \'unknown\' when the engine supplies no defeat source', function () {
        const { game, rec } = recorder();
        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#999', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit' });
        game.emit(EventName.OnCardDefeated, { card: unit, defeatSource: undefined });
        const defeat = rec.getEvents().find((e: any) => e.t === 'DEFEAT') as any;
        expect(defeat).toBeDefined();
        expect(defeat.reason).toBe('unknown');
    });

    it('maps an engine defeat cause to its closed-set name rather than passing the raw value', function () {
        const { game, rec } = recorder();
        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#998', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit' });
        game.emit(EventName.OnCardDefeated, { card: unit, defeatSource: { type: 'uniqueRule' } });
        const defeat = rec.getEvents().find((e: any) => e.t === 'DEFEAT') as any;
        expect(defeat.reason).toBe('uniqueRule');
    });

    // `src` is optional on HEAL: a source the writer cannot resolve is OMITTED, never written as
    // the sentinel 'unknown' -- a reader must be able to tell "nothing healed it" apart from
    // "something healed it and we could not name it".
    it('omits HEAL.src entirely when the healing source cannot be resolved', function () {
        const { game, rec } = recorder();
        const p1 = { id: 'p1' };
        const unit = fakeCard({ uuid: 'SOR#997', zoneName: 'groundArena', owner: p1, controller: p1, printedType: 'unit', remainingHp: 5 });
        game.emit(EventName.OnDamageHealed, { card: unit, damageHealed: 2, context: undefined });
        const heal = rec.getEvents().find((e: any) => e.t === 'HEAL') as any;
        expect(heal).toBeDefined();
        expect(heal.amt).toBe(2);
        expect('src' in heal).toBe(false);
    });
});

describe('SwuPgnRecorder rollback', function () {
    // Value: protects=a rollback to a snapshot taken many snapshots ago drops every record since; fails_when=checkpoints are capped and the restored snapshot's checkpoint was evicted, so the truncation lands at a later boundary; why_new=every rollback test restored a recent checkpoint; seam=none; no_claim=which snapshots the engine retains
    it('rolls back to a snapshot taken long before, dropping everything recorded since', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });
        const p1 = { id: 'p1' };
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        const boundaryEventsLen = rec.getEvents().length;

        for (let id = 1; id <= 40; id++) {
            rec.checkpoint(id);
            game.emit(EventName.OnPassAction, { player: p1 });
        }
        rec.rollbackTo(1, 'p1');

        const events = rec.getEvents() as any[];
        expect(events.slice(boundaryEventsLen).map((e) => e.t)).toEqual(['UNDO']);
    });

    // Value: protects=a rollback to a snapshot id the recorder never checkpointed truncates at the next checkpoint after it; fails_when=only an exact id match is honoured, so the undone records stay; why_new=every rollback test restored an id that had its own checkpoint; seam=none; no_claim=which ids the engine restores
    it('rolls back to a snapshot it has no checkpoint for at the next checkpoint after it', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });
        const p1 = { id: 'p1' };
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        const boundaryEventsLen = rec.getEvents().length;

        rec.checkpoint(3);
        game.emit(EventName.OnPassAction, { player: p1 });
        rec.checkpoint(5);
        game.emit(EventName.OnPassAction, { player: p1 });
        rec.rollbackTo(2, 'p1');

        const events = rec.getEvents() as any[];
        expect(events.slice(boundaryEventsLen).map((e) => e.t)).toEqual(['UNDO']);
    });

    // Value: protects=undoing to the same point twice leaves one UNDO note naming the real game record; fails_when=the earlier note is not unwrapped, giving an `-undo-undo` seq or an `at` that points at a note; why_new=no test repeated an undo; seam=none; no_claim=none beyond protects
    it('leaves one UNDO naming the real record when the same point is undone twice', function () {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, { cardId: (u: string) => u, seat: (p: string) => (p === 'p1' ? 1 : 2) as 1 | 2 });
        const p1 = { id: 'p1' };
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        const boundaryEventsLen = rec.getEvents().length;
        // The real path: push() checkpoints the engine's current snapshot id lazily, including
        // just before it appends the UNDO note, which is what the unwrap has to see through.
        (game as any).snapshotManager = { currentSnapshotId: 1 };

        game.emit(EventName.OnPassAction, { player: p1 });
        const undone = (rec.getEvents()[boundaryEventsLen] as any).seq;
        rec.rollbackTo(1, 'p1');
        game.emit(EventName.OnPassAction, { player: p1 });
        rec.rollbackTo(1, 'p1');

        const after = (rec.getEvents() as any[]).slice(boundaryEventsLen);
        expect(after.map((e) => e.t)).toEqual(['UNDO']);
        expect(after[0].at).toBe(undone);
        expect(after[0].seq).toBe(`${undone}-undo`);
    });

    it('truncates events + setup and restores counters/tokenParents to a checkpoint boundary', function () {
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

        // Emit MORE events after the checkpoint, including a SHIELD_GAIN (populates tokenParents)
        // and additional sub-events that bump the counters.
        const shieldTok = fakeCard({ uuid: 'SHIELDTOK_POST', owner: p1, isShield: true, printedType: 'token' });
        game.emit(EventName.OnCardPlayed, { card: unitB, player: p1, playType: 'play' });             // action 2
        game.emit(EventName.OnUpgradeAttached, { parentCard: unitB, upgradeCard: shieldTok });        // SHIELD_GAIN (2a)
        game.emit(EventName.OnCardExhausted, { card: unitB });                                         // 2b

        const before = rec.getEvents().length;
        expect(before).toBeGreaterThan(boundaryEventsLen);
        // tokenParents now has the post-checkpoint shield.
        expect((rec as any).tokenParents.has('SHIELDTOK_POST')).toBe(true);
        // counters advanced past the boundary.
        expect((rec as any).actionCounter).toBeGreaterThan(boundaryAction);

        const firstDropped = (rec.getEvents()[boundaryEventsLen] as any).seq;

        // Roll back to the checkpoint.
        rec.rollbackTo(1, 'p1');

        // events truncated back to the boundary; post-checkpoint events dropped. The UNDO note
        // left in their place is the one record the rollback ADDS (spec §10.2).
        const undo = rec.getEvents()[rec.getEvents().length - 1] as any;
        expect(undo.t).toBe('UNDO');
        expect(undo.at).toBe(firstDropped);
        expect(undo.seq).toBe(`${firstDropped}-undo`);
        expect(undo.by).toBe(1);
        expect(rec.getUndoCount()).toBe(1);
        expect(rec.getEvents().length).toBe(boundaryEventsLen + 1);
        expect(rec.getEvents().some((e: any) => e.card === 'SOR#401')).toBe(false);
        expect(rec.getEvents().some((e: any) => e.t === 'SHIELD_GAIN')).toBe(false);

        // counters restored exactly.
        expect((rec as any).actionCounter).toBe(boundaryAction);
        expect((rec as any).subEventCounter).toBe(boundarySub);

        // tokenParents restored to checkpoint state: the post-checkpoint shield is gone, so a
        // SHIELD_USE for it now finds no parent and is skipped (no SHIELD_USE record emitted).
        expect((rec as any).tokenParents.has('SHIELDTOK_POST')).toBe(false);
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

        // Nothing was truncated, so nothing is noted and nothing is counted.
        expect(() => rec.rollbackTo(999)).not.toThrow();
        expect(rec.getEvents().length).toBe(len);
        // rolling back to null is also a safe no-op.
        expect(() => rec.rollbackTo(null)).not.toThrow();
        expect(rec.getEvents().length).toBe(len);
        expect(rec.getUndoCount()).toBe(0);
    });
});

describe('SwuPgn.formatTokenId', function () {
    it('embeds a real numeric card id', function () {
        expect(SwuPgn.formatTokenId('advantage', '5844562972')).toBe('TOKEN:advantage#5844562972');
    });

    // Weakness and Beast carry placeholder ids ('weakness-id', 'beast-id') in their card data.
    // Emitting them would produce TOKEN:weakness#weakness-id, which looks resolvable and isn't.
    it('omits a non-numeric placeholder id rather than emitting a fake identifier', function () {
        expect(SwuPgn.formatTokenId('weakness', 'weakness-id')).toBe('TOKEN:weakness');
        expect(SwuPgn.formatTokenId('beast', 'beast-id')).toBe('TOKEN:beast');
        expect(SwuPgn.formatTokenId('shield', null)).toBe('TOKEN:shield');
    });
});

describe('SwuPgnRecorder internals', function () {
    // A recording bug must never crash gameplay, and a recording bug that fires on every
    // event must never drown the logs either. Both guarantees live in logError.
    it('caps logged errors and says once that it is suppressing the rest', function () {
        const warnSpy = spyOn(logger, 'warn');
        const rec = new SwuPgnRecorder(new FakeEmitter() as any, resolver) as any;

        for (let i = 0; i < 25; i++) {
            rec.logError('test', new Error(`boom ${i}`));
        }

        // 20 error lines + exactly one "further errors will be suppressed" line, then silence.
        expect(warnSpy.calls.count()).toBe(21);
        const suppression = warnSpy.calls.allArgs()
            .filter((args) => String(args[0]).includes('further recording errors will be suppressed'));
        expect(suppression.length).toBe(1);
    });

    it('keeps sub-event suffixes valid past the 26th sub-event', function () {
        const rec = new SwuPgnRecorder(new FakeEmitter() as any, resolver) as any;

        // Bijective base-26: a naive 'a'+n would run off the end of the alphabet into '{',
        // which the seq pattern ([A-Za-z0-9-]) rejects.
        expect(rec.subEventLetter(0)).toBe('a');
        expect(rec.subEventLetter(25)).toBe('z');
        expect(rec.subEventLetter(26)).toBe('aa');
        expect(rec.subEventLetter(27)).toBe('ab');
        expect(rec.subEventLetter(51)).toBe('az');
        expect(rec.subEventLetter(52)).toBe('ba');
        for (let n = 0; n < 200; n++) {
            expect(rec.subEventLetter(n)).toMatch(/^[a-z]+$/);
        }
    });
});

describe('SwuPgnRecorder: review regressions', function () {
    const mk = () => {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, resolver);
        return { game, rec };
    };
    const last = (rec: SwuPgnRecorder): any => rec.getEvents()[rec.getEvents().length - 1];

    it('GAME_END takes the .game-end step of the phase it happened in and never collides with PHASE_END', function () {
        const { game, rec } = mk();
        game.emit(EventName.OnPhaseStarted, { phase: 'regroup' });
        rec.addGameEndRecord(1, 'Concession');
        expect(last(rec).t).toBe('GAME_END');
        expect(last(rec).seq).toBe('R1.G.game-end');
        // Play may continue after game end, so that phase's PHASE_END is still written.
        game.emit(EventName.OnPhaseEnded, { phase: 'regroup' });
        const seqs = rec.getEvents().map((e) => e.seq);
        expect(new Set(seqs).size).toBe(seqs.length);
    });

    it('backfills a host only onto records of the action being recorded', function () {
        const { game, rec } = mk();
        const p1 = { id: 'p1' };
        const hostA = fakeCard({ uuid: 'HOST-A', zoneName: 'groundArena', owner: p1 });
        const hostB = fakeCard({ uuid: 'HOST-B', zoneName: 'groundArena', owner: p1 });
        const upg: any = fakeCard({ uuid: 'UPG', zoneName: 'groundArena', owner: p1, printedType: 'basicUpgrade' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: hostA, player: p1, playType: 'play' });
        game.emit(EventName.OnCardPlayed, { card: hostB, player: p1, playType: 'play' });

        // Engine order for a played upgrade: MOVE, attach, then OnCardPlayed (host reachable).
        game.emit(EventName.OnCardMoved, { card: upg, originalZone: 'hand', newZone: 'groundArena' });
        upg.parentCard = hostA;
        game.emit(EventName.OnUpgradeAttached, { parentCard: hostA, upgradeCard: upg });
        game.emit(EventName.OnCardPlayed, { card: upg, player: p1, playType: 'play' });

        // A later action bounces it and re-plays it onto a different host.
        game.emit(EventName.OnCardMoved, { card: upg, originalZone: 'groundArena', newZone: 'hand' });
        game.emit(EventName.OnCardMoved, { card: upg, originalZone: 'hand', newZone: 'groundArena' });
        upg.parentCard = hostB;
        game.emit(EventName.OnUpgradeAttached, { parentCard: hostB, upgradeCard: upg });
        game.emit(EventName.OnCardPlayed, { card: upg, player: p1, playType: 'play' });

        const arenaMoves = rec.getEvents().filter((e: any) => e.t === 'MOVE' && e.card === 'UPG' && e.to === 'ground') as any[];
        expect(arenaMoves.map((m) => m.attachedTo)).toEqual(['HOST-A', 'HOST-B']);
        expect(arenaMoves.map((m) => m.kind)).toEqual(['upgrade', 'upgrade']);
        const plays = rec.getEvents().filter((e: any) => e.t === 'PLAY_UPGRADE') as any[];
        expect(plays.map((p) => p.target)).toEqual(['HOST-A', 'HOST-B']);
        // The move back to hand attaches nothing and names no host.
        const toHand = rec.getEvents().find((e: any) => e.t === 'MOVE' && e.card === 'UPG' && e.to === 'hand') as any;
        expect(toHand.attachedTo).toBeUndefined();
    });

    it('TAKE_CONTROL re-seats a stolen unit and shifts a stolen resource; credits are skipped', function () {
        const { game, rec } = mk();
        const p1 = { id: 'p1' };
        const p2 = { id: 'p2' };
        const unit: any = fakeCard({ uuid: 'SOR#108', zoneName: 'groundArena', owner: p1 });
        const res: any = fakeCard({ uuid: 'SOR#050', zoneName: 'hand', owner: p1 });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        game.emit(EventName.OnCardMoved, { card: res, originalZone: 'hand', newZone: 'resource' });
        res.zoneName = 'resource';

        // A control change is not a zone change: the engine changes the controller in place.
        unit.controller = p2;
        game.emit(EventName.OnTakeControl, { card: unit, newController: p2 });
        res.controller = p2;
        game.emit(EventName.OnTakeControl, { card: res, newController: p2 });
        game.emit(EventName.OnTakeControl, { newController: p2, amount: 1, player: p1 }); // credit tokens

        const events = rec.getEvents() as GameEvent[];
        const steals = events.filter((e) => e.t === 'TAKE_CONTROL') as any[];
        expect(steals.map((s) => [s.p, s.zone, s.from])).toEqual([[2, 'ground', 1], [2, 'resource', 1]]);

        const s = fold(events);
        expect(s.players[1]?.cards.map((c) => c.id)).toEqual([]);
        expect(s.players[2]?.cards.map((c) => c.id)).toEqual(['SOR#108']);
        expect(s.players[1]?.resourcesReady).toBe(0);
        expect(s.players[2]?.resourcesReady).toBe(1);
    });

    it('records a leader deployed as a pilot as an attachment, never as its own unit', function () {
        const { game, rec } = mk();
        const p1 = { id: 'p1' };
        const xwing = fakeCard({ uuid: 'LAW#253', zoneName: 'spaceArena', owner: p1 });
        const leader = fakeCard({ uuid: 'SOR#001', zoneName: 'spaceArena', owner: p1, printedType: 'leader' });

        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: xwing, player: p1, playType: 'play' });
        game.emit(EventName.OnLeaderDeployed, { card: leader, player: p1, type: 'leaderUpgrade', leaderAttachTarget: xwing });

        const deploy = rec.getEvents().find((e) => e.t === 'DEPLOY_LEADER') as any;
        expect(deploy.kind).toBe('upgrade');
        expect(deploy.target).toBe('LAW#253');
        const s = fold(rec.getEvents());
        expect(s.players[1]?.cards.map((c) => c.id)).toEqual(['LAW#253']);
        expect(s.players[1]?.cards[0].upgrades).toContain('SOR#001');
    });

    it('counts every handler failure, capped logging or not, for the RecorderErrors header', function () {
        const { game, rec } = mk();
        spyOn(logger, 'warn');
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        for (let i = 0; i < 25; i++) {
            // A damage event whose target throws on every read.
            const hostile = new Proxy({}, {
                get: () => {
                    throw new Error('boom');
                },
            });
            game.emit(EventName.OnDamageDealt, { card: hostile });
        }
        expect(rec.getErrorCount()).toBe(25);
        const h = buildHeader({
            gameId: 'g', date: 'd', cardPool: 'SOR', engineVersion: 'forceteki@t', seed: 's', perspective: null,
            rounds: 1, result: 'Incomplete', reason: 'x',
            p1: { accountId: 'a', leader: 'L', base: 'B' }, p2: { accountId: 'b', leader: 'L', base: 'B' },
            recorderErrors: rec.getErrorCount(),
        });
        expect(h.recorderErrors).toBe(25);
    });
});

// The replay client's findings of 2026-09-05: resources counted rather than named, credits and
// the Force folded, host-less exits, captures that name their captor, and token upgrades
// classified by type so Weakness (and whatever is printed next) is a counter, not an upgrade.
describe('SwuPgnRecorder: resources, base tokens, captures, exits', function () {
    const mk = () => {
        const game = new FakeEmitter();
        const rec = new SwuPgnRecorder(game as any, resolver);
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        return { game, rec };
    };
    const p1 = { id: 'p1' };
    const p2 = { id: 'p2' };
    const ofType = (rec: SwuPgnRecorder, t: string): any[] => rec.getEvents().filter((e: any) => e.t === t);

    it('writes a resource-row ready/exhaust as the counter record, and a unit\'s by name', function () {
        const { game, rec } = mk();
        const res = fakeCard({ uuid: 'SOR#050', zoneName: 'resource', owner: p1 });
        const unit = fakeCard({ uuid: 'SOR#108', zoneName: 'groundArena', owner: p1 });
        game.emit(EventName.OnCardReadied, { card: res });
        game.emit(EventName.OnCardExhausted, { card: res });
        game.emit(EventName.OnCardReadied, { card: unit });
        game.emit(EventName.OnCardExhausted, { card: unit });

        expect(ofType(rec, 'READY_RESOURCES')).toEqual([{ seq: 'R1.A.0a', t: 'READY_RESOURCES', p: 1, amount: 1 }]);
        expect(ofType(rec, 'EXHAUST_RESOURCES')).toEqual([{ seq: 'R1.A.0b', t: 'EXHAUST_RESOURCES', p: 1, amount: 1 }]);
        expect(ofType(rec, 'READY').map((e) => e.card)).toEqual(['SOR#108']);
        expect(ofType(rec, 'EXHAUST').map((e) => e.card)).toEqual(['SOR#108']);
    });

    it('records the amount a cost or ability exhausts, and skips a free play', function () {
        const { game, rec } = mk();
        // ResourceCost's event: `player` and the post-adjuster `amount` are on the event.
        game.emit(EventName.OnExhaustResources, { player: p1, amount: 4, context: { player: p2 } });
        game.emit(EventName.OnExhaustResources, { player: p2, amount: 0 });
        // ExhaustResourcesSystem targeting the opponent, and ReadyResourcesSystem.
        game.emit(EventName.OnExhaustResources, { player: p2, amount: 1 });
        game.emit(EventName.OnReadyResources, { player: p1, amount: 2 });

        expect(ofType(rec, 'EXHAUST_RESOURCES').map((e) => [e.p, e.amount])).toEqual([[1, 4], [2, 1]]);
        expect(ofType(rec, 'READY_RESOURCES').map((e) => [e.p, e.amount])).toEqual([[1, 2]]);
    });

    it('a card an ability resources exhausted is a move into the row exhausted, not one more EXHAUST_RESOURCES; a ready one is not', function () {
        const { game, rec } = mk();
        const tired: any = fakeCard({ uuid: 'TWI#127', zoneName: 'resource', owner: p1 });
        const fresh: any = fakeCard({ uuid: 'SOR#050', zoneName: 'resource', owner: p1, exhausted: false });
        // The engine sets the flag AFTER the move event fires (Player.resourceCard).
        game.emit(EventName.OnCardMoved, { card: tired, originalZone: 'hand', newZone: 'resource' });
        tired.exhausted = true;
        game.emit(EventName.OnCardResourced, { card: tired });
        game.emit(EventName.OnCardMoved, { card: fresh, originalZone: 'deck', newZone: 'resource' });
        game.emit(EventName.OnCardResourced, { card: fresh });

        expect(ofType(rec, 'EXHAUST_RESOURCES')).toEqual([]);
        expect(ofType(rec, 'MOVE').map((m) => [m.card, m.exhausted])).toEqual([['TWI#127', true], ['SOR#050', undefined]]);
        const s = fold(rec.getEvents());
        expect([s.players[1]?.resourcesReady, s.players[1]?.resourcesExhausted]).toEqual([1, 1]);
    });

    it('writes a regroup resource as a move into the row exhausted', function () {
        const { game, rec } = mk();
        const card: any = fakeCard({ uuid: 'SOR#060', zoneName: 'resource', owner: p1 });
        game.emit(EventName.OnCardMoved, { card, originalZone: 'hand', newZone: 'resource' });
        card.exhausted = true; // Player.resourceCard(card, true), after moveTo
        game.emit(EventName.OnPhaseEnded, { phase: 'regroup' });

        const move = ofType(rec, 'MOVE').find((m) => m.card === 'SOR#060');
        expect(move).toEqual(jasmine.objectContaining({ from: 'hand', to: 'resource', exhausted: true }));
        const resource = ofType(rec, 'RESOURCE').find((r) => r.card === 'SOR#060');
        expect(resource).toBeDefined();
        expect(ofType(rec, 'EXHAUST_RESOURCES')).toEqual([]);
        expect(fold(rec.getEvents()).players[1]?.resourcesExhausted).toBe(1);
    });

    it('writes setup resources without the flag', function () {
        const { game, rec } = mk();
        const card: any = fakeCard({ uuid: 'SOR#061', zoneName: 'resource', owner: p1 });
        game.emit(EventName.OnCardMoved, { card, originalZone: 'hand', newZone: 'resource' });
        card.exhausted = false;
        game.emit(EventName.OnPhaseEnded, { phase: 'setup' });

        const move = ofType(rec, 'MOVE').find((m) => m.card === 'SOR#061');
        expect(move).toBeDefined();
        expect('exhausted' in move).toBeFalse();
        expect(fold(rec.getEvents()).players[1]?.resourcesReady).toBe(1);
    });

    it('keeps a pending resource flag when the undo lands after its move', function () {
        const { game, rec } = mk();
        const card: any = fakeCard({ uuid: 'SOR#063', zoneName: 'resource', owner: p1 });
        game.emit(EventName.OnCardMoved, { card, originalZone: 'hand', newZone: 'resource' });
        // Checkpoint taken after the move: the next engine event settles the flag.
        rec.checkpoint(5);
        game.emit(EventName.OnCardDiscarded, { card: fakeCard({ uuid: 'SOR#064', owner: p1 }) });
        rec.rollbackTo(5);
        card.exhausted = true;
        game.emit(EventName.OnPhaseEnded, { phase: 'regroup' });

        const move = ofType(rec, 'MOVE').find((m) => m.card === 'SOR#063');
        expect(move).toEqual(jasmine.objectContaining({ to: 'resource', exhausted: true }));
    });

    it('does not carry a pending resource flag across an undo', function () {
        const { game, rec } = mk();
        rec.checkpoint(1);
        const card: any = fakeCard({ uuid: 'SOR#062', zoneName: 'resource', owner: p1 });
        game.emit(EventName.OnCardMoved, { card, originalZone: 'hand', newZone: 'resource' });
        rec.rollbackTo(1);
        card.exhausted = true;
        game.emit(EventName.OnPhaseEnded, { phase: 'regroup' });
        expect(ofType(rec, 'MOVE').filter((m) => m.card === 'SOR#062')).toEqual([]);
    });

    it('a resource leaving the row says whether it left exhausted', function () {
        const { game, rec } = mk();
        const spent = fakeCard({ uuid: 'SHD#001', zoneName: 'groundArena', owner: p1, exhaustedBeforeMove: true });
        const ready = fakeCard({ uuid: 'SHD#002', zoneName: 'hand', owner: p1, exhaustedBeforeMove: false });
        game.emit(EventName.OnCardMoved, { card: spent, originalZone: 'resource', newZone: 'groundArena' });
        game.emit(EventName.OnCardMoved, { card: ready, originalZone: 'resource', newZone: 'hand' });
        // Leaving any other zone never carries the flag, whatever the card says.
        const other = fakeCard({ uuid: 'SHD#003', zoneName: 'discard', owner: p1, exhaustedBeforeMove: true });
        game.emit(EventName.OnCardMoved, { card: other, originalZone: 'groundArena', newZone: 'discard' });

        const moves = ofType(rec, 'MOVE');
        expect(moves.map((m) => [m.card, m.exhausted])).toEqual([['SHD#001', true], ['SHD#002', undefined], ['SHD#003', undefined]]);
    });

    it('a Credit token going base -> base is the TAKE_CONTROL it is; other no-op moves are dropped', function () {
        const { game, rec } = mk();
        const credit: any = fakeCard({ uuid: 'TOKEN:credit#8015500527', zoneName: 'base', owner: p2, isToken: true });
        game.emit(EventName.OnCardMoved, { card: credit, originalZone: 'outsideTheGame', newZone: 'base' });
        // CreditToken.takeControl: controller changes, then moveTo(Base) into the new controller's base.
        credit.controller = p1;
        credit.owner = p1;
        game.emit(EventName.OnCardMoved, { card: credit, originalZone: 'base', newZone: 'base' });
        // A deck -> deck (search) or a non-token base -> base is still noise.
        const leader = fakeCard({ uuid: 'SOR#010', zoneName: 'base', owner: p1, printedType: 'leader' });
        game.emit(EventName.OnCardMoved, { card: leader, originalZone: 'base', newZone: 'base' });
        game.emit(EventName.OnCardMoved, { card: fakeCard({ uuid: 'X', zoneName: 'deck', owner: p1 }), originalZone: 'deck', newZone: 'deck' });

        expect(ofType(rec, 'TAKE_CONTROL')).toEqual([{ seq: 'R1.A.0b', t: 'TAKE_CONTROL', p: 1, card: 'TOKEN:credit#8015500527', zone: 'base', from: 2 }]);
        expect(ofType(rec, 'MOVE').length).toBe(1);
        const s = fold(rec.getEvents());
        expect([s.players[1]?.credits, s.players[2]?.credits]).toEqual([1, 0]);
    });

    it('CAPTURE names the captor and the seat that now holds the card; RESCUE the owner', function () {
        const { game, rec } = mk();
        const captor = fakeCard({ uuid: 'LOF#164', zoneName: 'groundArena', owner: p1 });
        const victim: any = fakeCard({ uuid: 'SOR#095', zoneName: 'groundArena', owner: p2 });
        const base1 = fakeCard({ uuid: 'SOR#028', isBase: true, owner: p1 });
        game.emit(EventName.OnCardPlayed, { card: captor, player: p1, playType: 'play' });
        game.emit(EventName.OnCardPlayed, { card: victim, player: p2, playType: 'play' });
        victim.zoneName = 'capture';
        game.emit(EventName.OnCardMoved, { card: victim, originalZone: 'groundArena', newZone: 'capture' });
        game.emit(EventName.OnCardCaptured, { card: victim, captor });
        game.emit(EventName.OnRescue, { card: victim });
        game.emit(EventName.OnCardMoved, { card: victim, originalZone: 'capture', newZone: 'groundArena' });
        game.emit(EventName.OnCardCaptured, { card: victim, captor: base1 });

        expect(ofType(rec, 'CAPTURE').map((e) => [e.p, e.card, e.by])).toEqual([[1, 'SOR#095', 'LOF#164'], [1, 'SOR#095', 'base@1']]);
        expect(ofType(rec, 'RESCUE').map((e) => [e.p, e.card])).toEqual([[2, 'SOR#095']]);
        const afterFirst = fold(rec.getEvents().slice(0, 6));
        expect(afterFirst.players[1]?.cards[0].captured).toEqual(['SOR#095']);
        expect(afterFirst.players[2]?.cards).toEqual([]);
    });

    it('classifies a Weakness token as a status token by type, and names no host on any exit', function () {
        const { game, rec } = mk();
        const unit = fakeCard({ uuid: 'SOR#300', zoneName: 'groundArena', owner: p1 });
        const weak: any = fakeCard({ uuid: 'TOKEN:weakness#weakness-id', owner: p1, isWeakness: true, printedType: 'tokenUpgrade' });
        weak.isUpgrade = () => true;
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        game.emit(EventName.OnCardMoved, { card: weak, originalZone: 'outsideTheGame', newZone: 'groundArena' });
        game.emit(EventName.OnUpgradeAttached, { parentCard: unit, upgradeCard: weak });
        game.emit(EventName.OnCardDefeated, { card: weak, defeatSource: { type: 'ability' } });
        game.emit(EventName.OnCardMoved, { card: weak, originalZone: 'groundArena', newZone: 'outsideTheGame' });

        expect(ofType(rec, 'STATUS_TOKEN').map((e) => [e.token, e.count])).toEqual([['weakness', 1], ['weakness', -1]]);
        const [entry, exit] = ofType(rec, 'MOVE').filter((m) => m.card === weak.uuid);
        expect(entry.attachedTo).toBe('SOR#300');
        expect(exit.attachedTo).toBeUndefined();
        expect(fold(rec.getEvents()).players[1]?.cards[0]).toEqual(jasmine.objectContaining({ upgrades: [], statusTokens: {} }));
    });

    it('writes EXHAUST for a unit that entered play exhausted, nothing for one that entered ready', function () {
        const { game, rec } = mk();
        const tired: any = fakeCard({ uuid: 'SOR#095', zoneName: 'groundArena', owner: p1, exhausted: true });
        const fresh: any = fakeCard({ uuid: 'SOR#128', zoneName: 'groundArena', owner: p1, exhausted: false });
        game.emit(EventName.OnCardMoved, { card: tired, originalZone: 'hand', newZone: 'groundArena' });
        game.emit(EventName.OnUnitEntersPlay, { card: tired, player: p1 });
        game.emit(EventName.OnCardMoved, { card: fresh, originalZone: 'hand', newZone: 'groundArena' });
        game.emit(EventName.OnUnitEntersPlay, { card: fresh, player: p1 });
        expect(ofType(rec, 'EXHAUST').map((e) => e.card)).toEqual(['SOR#095']);
        const cards = fold(rec.getEvents()).players[1]?.cards ?? [];
        expect(cards.map((c) => [c.id, c.exhausted])).toEqual([['SOR#095', true], ['SOR#128', false]]);
    });

    it('a Leader Unit sent home writes its EXHAUST beside the move back; the deploy says whether an Epic Action was spent', function () {
        const { game, rec } = mk();
        const leader: any = fakeCard({ uuid: 'SOR#010', zoneName: 'groundArena', owner: p1, printedType: 'leader' });
        leader.isLeader = () => true;
        game.emit(EventName.OnLeaderDeployed, { card: leader, player: p1, context: { ability: { isEpicAction: true } } });
        leader.zoneName = 'base';
        leader.exhausted = true;
        game.emit(EventName.OnCardMoved, { card: leader, originalZone: 'groundArena', newZone: 'base' });
        expect(ofType(rec, 'DEPLOY_LEADER')[0].epic).toBe(true);
        const tail = rec.getEvents().slice(-2)
            .map((e: any) => [e.t, e.card, e.from, e.to]);
        expect(tail).toEqual([['MOVE', 'SOR#010', 'ground', 'base'], ['EXHAUST', 'SOR#010', undefined, undefined]]);
        expect(fold(rec.getEvents()).players[1]?.leader).toEqual({ id: 'SOR#010', deployed: false, exhausted: true, epicActionUsed: true });
    });

    it('writes STATS after any event that changed a unit\'s live power, HP or keywords, and forgets units that left', function () {
        const game: any = new FakeEmitter();
        const unit: any = fakeCard({ uuid: 'SOR#095', zoneName: 'groundArena', owner: p1 });
        let power = 3;
        let keywords: any[] = [];
        unit.getPower = () => power;
        unit.getHp = () => 3;
        Object.defineProperty(unit, 'keywords', { get: () => keywords });
        let arena: any[] = [unit];
        game.getPlayers = () => [{ id: 'p1', getArenaUnits: () => arena }, { id: 'p2', getArenaUnits: () => [] }];
        const rec = new SwuPgnRecorder(game, resolver);
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardPlayed, { card: unit, player: p1, playType: 'play' });
        // Raid during an attack: +2 while attacking, back afterwards.
        power = 5;
        keywords = [{ name: 'raid', hasNumericValue: () => true, value: 2, isBlank: false }];
        game.emit(EventName.OnAttackDeclared, { attack: { attacker: unit, attackingPlayer: p1, getAllTargets: () => [] } });
        power = 3;
        keywords = [];
        game.emit(EventName.OnCardExhausted, { card: unit });
        // Nothing changed: no record.
        game.emit(EventName.OnCardReadied, { card: unit });
        arena = [];
        game.emit(EventName.OnCardMoved, { card: unit, originalZone: 'groundArena', newZone: 'discard' });
        arena = [unit];
        game.emit(EventName.OnCardMoved, { card: unit, originalZone: 'discard', newZone: 'groundArena' });

        expect(ofType(rec, 'STATS').map((e) => [e.power, e.hp, e.keywords])).toEqual([
            [3, 3, []], [5, 3, ['raid 2']], [3, 3, []], [3, 3, []],
        ]);
    });

    it('a stolen exhausted resource says so', function () {
        const { game, rec } = mk();
        const res: any = fakeCard({ uuid: 'SOR#050', zoneName: 'resource', owner: p1, exhausted: true });
        res.controller = p2;
        game.emit(EventName.OnTakeControl, { card: res, newController: p2 });
        expect(ofType(rec, 'TAKE_CONTROL')[0]).toEqual(jasmine.objectContaining({ p: 2, zone: 'resource', from: 1, exhausted: true }));
    });
});

// A base whose damage reached its HP falls by the rules, which raise no event: the recorder
// writes its DEFEAT at game end, blaming the last hit the base took.
describe('SwuPgnRecorder: a base destroyed by damage gets a DEFEAT at game end', function () {
    const p1 = { id: 'p1' };
    const p2 = { id: 'p2' };
    const printed = (uuid: string, owner: any) => ({ ...fakeCard({ uuid, zoneName: 'groundArena', owner }), setId: { set: 'sor', number: 1 } });

    /** A recorder over a game whose seat-2 base has taken `damage` of 30. */
    const mk = (damage: number) => {
        const game: any = new FakeEmitter();
        const base1: any = { ...fakeCard({ uuid: 'SOR#020', isBase: true, owner: p1, remainingHp: 30 }), damage: 0, getHp: () => 30 };
        const base2: any = { ...fakeCard({ uuid: 'SOR#028', isBase: true, owner: p2, remainingHp: 30 - damage }), damage, getHp: () => 30 };
        game.getPlayers = () => [{ id: 'p1', base: base1 }, { id: 'p2', base: base2 }];
        const rec = new SwuPgnRecorder(game, resolver);
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        return { game, rec, base2 };
    };
    const baseDefeats = (rec: SwuPgnRecorder) => (rec.getEvents() as any[]).filter((e) => e.t === 'DEFEAT' && (/^base@/).test(e.card));

    // Value: protects=recordDamageBaseDefeats reason/culprit per last hit + skip/no-op guards; fails_when=reason mapping, OVERWHELM attacker lookup, or dedupe breaks; why_new=engine specs only cover combat + ability defeat; seam=none; no_claim=engine damage types
    it('maps the last hit to the reason and culprit, skips a base already defeated, and writes nothing for a standing base', function () {
        const end = (rec: SwuPgnRecorder) => {
            rec.addGameEndRecord(1, 'Base Destroyed');
            const events = rec.getEvents() as any[];
            expect(events[events.length - 1].t).withContext('GAME_END stays last')
                .toBe('GAME_END');
            return baseDefeats(rec);
        };

        // Ability damage: non-combat, blamed on the card whose ability dealt it.
        {
            const { game, rec, base2 } = mk(30);
            game.emit(EventName.OnDamageDealt, { card: base2, context: { source: printed('SOR#200', p1) }, damageDealt: 3, type: 'ability' });
            expect(end(rec)).toEqual([jasmine.objectContaining({ card: 'base@2', reason: 'nonCombatDamage', defeatedBy: 'SOR#200' })]);
        }
        // Damage no card dealt (an empty-deck draw's framework source): no src, so the rules did it.
        {
            const { game, rec, base2 } = mk(30);
            game.emit(EventName.OnDamageDealt, { card: base2, context: { source: { title: 'Framework effect' } }, damageDealt: 3, type: 'ability' });
            const dmg = (rec.getEvents() as any[]).find((e) => e.t === 'DAMAGE');
            expect(dmg.src).withContext('a non-card source is omitted, not written as its display string')
                .toBeUndefined();
            const [defeat] = end(rec);
            expect(defeat).toEqual(jasmine.objectContaining({ card: 'base@2', reason: 'frameworkEffect' }));
            expect(defeat.defeatedBy).toBeUndefined();
        }
        // Overwhelm: an attack, blamed on the attacker the ATTACK before it names.
        {
            const { game, rec, base2 } = mk(30);
            const atk = printed('SOR#300', p1);
            const def = printed('SOR#400', p2);
            game.emit(EventName.OnAttackDeclared, { attack: { attacker: atk, attackingPlayer: p1, getAllTargets: () => [def] } });
            game.emit(EventName.OnDamageDealt, { card: base2, damageSource: { attack: { attacker: atk } }, damageDealt: 2, type: 'overwhelm' });
            expect(end(rec)).toEqual([jasmine.objectContaining({ card: 'base@2', reason: 'attack', defeatedBy: 'SOR#300' })]);
        }
        // Already defeated outright by an ability: no second DEFEAT.
        {
            const { game, rec, base2 } = mk(30);
            game.emit(EventName.OnBaseDefeated, { card: base2, context: { source: printed('HMW#004', p1) } });
            expect(end(rec)).toEqual([jasmine.objectContaining({ card: 'base@2', reason: 'ability', defeatedBy: 'HMW#004' })]);
        }
        // A base with HP left (a concession): nothing.
        {
            const { game, rec, base2 } = mk(29);
            game.emit(EventName.OnDamageDealt, { card: base2, context: { source: printed('SOR#200', p1) }, damageDealt: 3, type: 'ability' });
            expect(end(rec)).toEqual([]);
        }
    });
});

describe('SwuPgnRecorder: base defeats are written beside the hit, and DRAW counts cards drawn', function () {
    const p1 = { id: 'p1' };
    const p2 = { id: 'p2' };
    const printed = (uuid: string, owner: any) => ({ ...fakeCard({ uuid, zoneName: 'groundArena', owner }), setId: { set: 'sor', number: 1 } });

    /** A recorder over a game whose bases have taken `d1` / `d2` damage of 30. */
    const mk = (d1: number, d2: number) => {
        const game: any = new FakeEmitter();
        const base1: any = { ...fakeCard({ uuid: 'SOR#020', isBase: true, owner: p1, remainingHp: 30 - d1 }), damage: d1, getHp: () => 30 };
        const base2: any = { ...fakeCard({ uuid: 'SOR#028', isBase: true, owner: p2, remainingHp: 30 - d2 }), damage: d2, getHp: () => 30 };
        game.getPlayers = () => [{ id: 'p1', base: base1 }, { id: 'p2', base: base2 }];
        const rec = new SwuPgnRecorder(game, resolver);
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        return { game, rec, base1, base2 };
    };
    const kinds = (rec: SwuPgnRecorder) => (rec.getEvents() as any[]).map((e) => `${e.t}:${e.card ?? e.tgt ?? ''}`);

    // Value: protects=a lethal hit's base DEFEAT is written right after it, with no game end needed; fails_when=DEFEAT only comes from addGameEndRecord (continued play loses it); why_new=game-end tests always call addGameEndRecord; seam=none; no_claim=engine continue-playing flow
    it('writes the DEFEAT right after the lethal hit, before and without any game end', function () {
        const { game, rec, base2 } = mk(0, 30);
        game.emit(EventName.OnDamageDealt, { card: base2, context: { source: printed('SOR#200', p1) }, damageDealt: 3, type: 'ability' });
        expect(kinds(rec).slice(-2)).toEqual(['DAMAGE:base@2', 'DEFEAT:base@2']);
        expect(rec.hasRecordedBaseDefeat(2)).toBeTrue();
        expect(rec.hasRecordedBaseDefeat(1)).toBeFalse();
        // The game-end backstop does not write a second one.
        rec.addGameEndRecord(1, 'Base Destroyed');
        expect(kinds(rec).filter((k) => k === 'DEFEAT:base@2').length).toBe(1);
    });

    // Value: protects=both bases falling (a draw) each get a DEFEAT blamed on their own last hit; fails_when=the loop stops after one base or reuses one culprit; why_new=every test had one dead base; seam=none; no_claim=engine draw detection
    it('writes a DEFEAT for each base when both fall', function () {
        const { game, rec, base1, base2 } = mk(30, 30);
        game.emit(EventName.OnDamageDealt, { card: base1, context: { source: printed('SOR#201', p2) }, damageDealt: 3, type: 'ability' });
        game.emit(EventName.OnDamageDealt, { card: base2, context: { source: printed('SOR#200', p1) }, damageDealt: 3, type: 'ability' });
        rec.addGameEndRecord('Draw', 'Base Destroyed');
        const defeats = (rec.getEvents() as any[]).filter((e) => e.t === 'DEFEAT');
        expect(defeats).toEqual([
            jasmine.objectContaining({ card: 'base@1', reason: 'nonCombatDamage', defeatedBy: 'SOR#201' }),
            jasmine.objectContaining({ card: 'base@2', reason: 'nonCombatDamage', defeatedBy: 'SOR#200' }),
        ]);
        const events = rec.getEvents() as any[];
        expect(events[events.length - 1].t).toBe('GAME_END');
    });

    // Value: protects=DRAW.count equals the cards actually drawn; fails_when=count reverts to the requested amount; why_new=every existing DRAW drew what it asked for; seam=none; no_claim=engine empty-deck damage
    it('counts the cards actually drawn, not the number asked for', function () {
        const game: any = new FakeEmitter();
        const rec = new SwuPgnRecorder(game, resolver);
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardsDrawn, { player: p1, cards: [fakeCard({ uuid: 'SOR#100', owner: p1 })], amount: 2 });
        game.emit(EventName.OnCardsDrawn, { player: p1, cards: [], amount: 2 });
        const draws = (rec.getEvents() as any[]).filter((e) => e.t === 'DRAW');
        expect(draws.map((e) => [e.count, e.cards.length])).toEqual([[1, 1], [0, 0]]);
    });

    // Value: protects=a lethal Overwhelm hit's base DEFEAT is written right after the OVERWHELM record and blamed on the attacker; fails_when=the OVERWHELM branch returns before recordLethalBaseHit, or the culprit lookup skips OVERWHELM; why_new=the beside-the-hit test only used ability DAMAGE; seam=none; no_claim=engine AttackFlow overwhelm math
    it('writes the DEFEAT right after a lethal OVERWHELM, blamed on the attacker', function () {
        const { game, rec, base2 } = mk(0, 30);
        const atk = printed('SOR#300', p1);
        game.emit(EventName.OnAttackDeclared, { attack: { attacker: atk, attackingPlayer: p1, getAllTargets: () => [printed('SOR#400', p2)] } });
        game.emit(EventName.OnDamageDealt, { card: base2, damageSource: { attack: { attacker: atk } }, damageDealt: 2, type: 'overwhelm' });
        expect(kinds(rec).slice(-2)).toEqual(['OVERWHELM:base@2', 'DEFEAT:base@2']);
        const events = rec.getEvents() as any[];
        expect(events[events.length - 1]).toEqual(jasmine.objectContaining({ reason: 'attack', defeatedBy: 'SOR#300' }));
        expect(rec.hasRecordedBaseDefeat(2)).toBeTrue();
    });
});

describe('SwuPgnRecorder: ABILITY_ACTIVATE.grantedBy names only another card', function () {
    const p1 = { id: 'p1' };

    /** The grantedBy of the one ABILITY_ACTIVATE a gained ability on a base writes. */
    const grantedByFor = (gainAbilitySource: (base: any) => any) => {
        const game: any = new FakeEmitter();
        const rec = new SwuPgnRecorder(game, resolver);
        const base: any = fakeCard({ uuid: 'SOR#029', zoneName: 'base', owner: p1, controller: p1, isBase: true });
        game.emit(EventName.OnPhaseStarted, { phase: 'action' });
        game.emit(EventName.OnCardAbilityInitiated, {
            card: base,
            ability: { abilityIdentifier: 'gained_action', isCardAbility: () => true, printedAbility: false, gainAbilitySource: gainAbilitySource(base) },
        });
        const acts = (rec.getEvents() as any[]).filter((e) => e.t === 'ABILITY_ACTIVATE');
        expect(acts.length).toBe(1);
        return acts[0].grantedBy;
    };

    // Value: protects=grantedBy is omitted when the source is the activating card itself or no card at all, and set for another card; fails_when=the self check or the sourceRef card check is dropped and grantedBy names the card itself or a display string; why_new=the real-game tests only cover a printed ability (no source) and a real Fortify upgrade; seam=none; no_claim=which engine abilities set gainAbilitySource
    it('omits grantedBy for a self or non-card source, and names an upgrade that granted it', function () {
        expect(grantedByFor((base) => base)).withContext('granted by itself')
            .toBeUndefined();
        expect(grantedByFor(() => ({ title: 'Framework effect' }))).withContext('granted by no card')
            .toBeUndefined();
        expect(grantedByFor(() => ({ ...fakeCard({ uuid: 'HMW#126', zoneName: 'base', owner: p1 }), setId: { set: 'hmw', number: 126 } })))
            .toBe('HMW#126');
    });
});

describe('SwuPgnRecorder: modal effects', function () {
    integration(function (contextRef) {
        // Value: protects=each mode picked from a "choose N" prompt is a MODAL_CHOICE under the play (spec §10.2, writer revision 4); fails_when=ModalEffectSelectionPrompt stops emitting OnModalChoice and the picks reach no record; why_new=only HandlerMenuPrompt and ActionSelectionPrompt picks were recorded; seam=none; no_claim=modes picked by the opponent
        it('records each mode a player picks from a modal effect', async function () {
            const returnPrompt = 'Return a non-leader unit with 4 or less power to its owner\'s hand';
            const buffPrompt = 'Give a unit +4/+0 for this phase';
            const exhaustPrompt = 'Exhaust up to 2 units';
            const discardPrompt = 'An opponent discards a random card from their hand';
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['cunning'], groundArena: ['wampa'] },
                player2: { hand: ['pyke-sentinel', 'moisture-farmer'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.cunning);
            context.player1.clickPrompt(discardPrompt);
            context.player1.clickPrompt(buffPrompt);
            context.player1.clickCard(context.wampa);
            expect(context.player2).toBeActivePlayer();

            const events = parse(context.game.getCachedSwuPgn()).events as any[];
            const play = events.find((e) => e.t === 'PLAY_EVENT');
            expect(play).withContext('Cunning is played')
                .toBeDefined();
            // Setup's own MODAL_CHOICE (who goes first) comes earlier; only the play's picks count.
            const picks = events.slice(events.indexOf(play)).filter((e) => e.t === 'MODAL_CHOICE');
            expect(picks).toEqual([
                jasmine.objectContaining({ p: 1, offered: [returnPrompt, buffPrompt, exhaustPrompt, discardPrompt], chose: 3 }),
                jasmine.objectContaining({ p: 1, offered: [returnPrompt, buffPrompt, exhaustPrompt], chose: 1 }),
            ]);
            for (const pick of picks) {
                expect(pick.seq).withContext('lettered under the PLAY_EVENT')
                    .toMatch(new RegExp(`^${play.seq.replace(/\./g, '\\.')}[a-z]+$`));
            }
        });
    });
});

describe('SwuPgnRecorder: a play\'s setup is filed under the play', function () {
    integration(function (contextRef) {
        // The cost's own records: the card going to the discard pile, and its DEFEAT or DISCARD.
        const costRecords = (events: any[], card: string) => events.filter((e) =>
            (e.t === 'MOVE' && e.card === card && e.to === 'discard') ||
            ((e.t === 'DEFEAT' && e.card === card) || (e.t === 'DISCARD' && e.cards.includes(card))));

        // Value: protects=the records a play's cost writes before the play is announced carry the play's `for` (spec §9.1 belonging, [W-18]); fails_when=the recorder stops marking records written while a play ability is set up, or the linker stops honouring the mark; why_new=Exploit's choices and defeat, and a discard paid instead of a cost, carried no `for`; seam=none; no_claim=costs of action abilities, which are paid after they are announced
        it('files an Exploit defeat and its choices under the play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['droideka-security'], groundArena: ['admiral-piett#captain-of-the-executor'], resources: 6 },
                player2: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.droidekaSecurity);
            context.player1.clickPrompt('Trigger Exploit');
            context.player1.clickCard(context.admiralPiett);
            context.player1.clickPrompt('Done');

            const events = parse(context.game.getCachedSwuPgn()).events as any[];
            const play = events.find((e) => e.t === 'PLAY');
            const piett = events.find((e) => e.t === 'DEFEAT').card;
            expect(costRecords(events, piett).map((e) => [e.t, e.for])).toEqual([['MOVE', play.seq], ['DEFEAT', play.seq]]);
            const choices = events.slice(0, events.indexOf(play)).filter((e) => e.t === 'CHOICE' || e.t === 'MODAL_CHOICE')
                .slice(-2);
            expect(choices.map((e) => e.for)).toEqual([play.seq, play.seq]);
        });

        it('files a discard paid instead of an event\'s cost under the event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['bamboozle', 'crafty-smuggler'] },
                player2: { groundArena: ['wampa'] },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.bamboozle);
            context.player1.clickPrompt('Play Bamboozle by discarding a Cunning card');
            context.player1.clickCard(context.craftySmuggler);
            context.player1.clickCard(context.wampa);

            const events = parse(context.game.getCachedSwuPgn()).events as any[];
            const play = events.find((e) => e.t === 'PLAY_EVENT');
            const smuggler = events.find((e) => e.t === 'DISCARD').cards[0];
            expect(costRecords(events, smuggler).map((e) => [e.t, e.for])).toEqual([['MOVE', play.seq], ['DISCARD', play.seq]]);
        });

        // Value: protects=a discard the previous action forced stays under that action, not the discarding player's next play (spec §9.1, [W-18]); fails_when=the linker files an unmarked discard of another card under the next play; why_new=the linker took any same-seat discard from hand to be a cost; seam=none; no_claim=forced discards picked in a different mode order
        it('never files a discard the opponent forced under the discarding player\'s next play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['cunning'], groundArena: ['wampa'] },
                player2: { hand: ['battlefield-marine', 'battlefield-marine'], resources: 6 },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.cunning);
            context.player1.clickPrompt('Give a unit +4/+0 for this phase');
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('An opponent discards a random card from their hand');
            const left = context.player2.findCardsByName('battlefield-marine').find((c: any) => c.zoneName === 'hand');
            context.player2.clickCard(left);

            const events = parse(context.game.getCachedSwuPgn()).events as any[];
            const discard = events.find((e) => e.t === 'DISCARD');
            expect(costRecords(events, discard.cards[0]).map((e) => [e.t, e.for])).toEqual([['MOVE', undefined], ['DISCARD', undefined]]);
        });
    });
});
