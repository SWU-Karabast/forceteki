import { EventEmitter } from 'events';
import { PgnReplayRecorder } from '../../../server/game/core/chat/PgnReplayRecorder';
import type { IPgnReplayRecord, IStructureMarker } from '../../../server/game/core/chat/PgnTypes';
import { PgnActionType } from '../../../server/game/core/chat/PgnTypes';
import { EventName, PhaseName } from '../../../server/game/core/Constants';

/**
 * Minimal Game stub — extends EventEmitter so PgnReplayRecorder can call game.on().
 */
function makeGame(players: { id: string; name: string }[] = []): any {
    const emitter = new EventEmitter();
    const game: any = Object.assign(emitter, {
        roundNumber: 1,
        currentPhase: PhaseName.Action,
        gameChat: { messages: [] },
        currentEventWindow: null,
        getPlayers: () =>
            players.map((p) => ({ id: p.id, name: p.name })),
    });
    return game;
}

describe('PgnReplayRecorder', () => {
    // ── Importable and constructable ─────────────────────────────────────────

    it('can be imported and instantiated without throwing', () => {
        const game = makeGame();
        expect(() => new PgnReplayRecorder(game)).not.toThrow();
    });

    // ── getRecords ───────────────────────────────────────────────────────────

    describe('getRecords()', () => {
        it('returns an array', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            expect(Array.isArray(recorder.getRecords())).toBe(true);
        });

        it('starts empty', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            expect(recorder.getRecords().length).toBe(0);
        });

        it('returns IPgnReplayRecord objects with seq and type after events', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);

            // Trigger OnBeginRound
            game.emit(EventName.OnBeginRound, {});

            const records = recorder.getRecords();
            expect(records.length > 0).toBe(true);

            const first = records[0];
            expect(typeof first.seq).toBe('string');
            expect(typeof first.type).toBe('string');
        });
    });

    // ── getStructureMarkers ──────────────────────────────────────────────────

    describe('getStructureMarkers()', () => {
        it('returns an array', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            expect(Array.isArray(recorder.getStructureMarkers())).toBe(true);
        });

        it('starts empty', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            expect(recorder.getStructureMarkers().length).toBe(0);
        });

        it('adds a round marker on OnBeginRound', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});

            const markers = recorder.getStructureMarkers();
            const roundMarker = markers.find((m) => m.type === 'round');
            expect(roundMarker).toBeDefined();
            expect(typeof (roundMarker as IStructureMarker).messageIndex).toBe('number');
        });

        it('adds a phase marker on OnPhaseStarted', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const markers = recorder.getStructureMarkers();
            const phaseMarker = markers.find((m) => m.type === 'phase');
            expect(phaseMarker).toBeDefined();
        });
    });

    // ── initPlayerMap ────────────────────────────────────────────────────────

    describe('initPlayerMap()', () => {
        it('can be called without throwing', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            expect(() => recorder.initPlayerMap()).not.toThrow();
        });
    });

    // ── Structural records ───────────────────────────────────────────────────

    describe('OnBeginRound', () => {
        it('emits a ROUND_START record', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});

            const records = recorder.getRecords();
            const roundStart = records.find((r) => r.type === PgnActionType.RoundStart);
            expect(roundStart).toBeDefined();
        });
    });

    describe('OnRoundEnded', () => {
        it('emits a ROUND_END record', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});
            game.emit(EventName.OnRoundEnded, {});

            const records = recorder.getRecords();
            const roundEnd = records.find((r) => r.type === PgnActionType.RoundEnd);
            expect(roundEnd).toBeDefined();
        });
    });

    describe('OnPhaseStarted', () => {
        it('emits a PHASE_START record', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Setup });

            const records = recorder.getRecords();
            const phaseStart = records.find((r) => r.type === PgnActionType.PhaseStart);
            expect(phaseStart).toBeDefined();
        });
    });

    describe('OnPhaseEnded', () => {
        it('emits a PHASE_END record', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseEnded, { phase: PhaseName.Action });

            const records = recorder.getRecords();
            const phaseEnd = records.find((r) => r.type === PgnActionType.PhaseEnd);
            expect(phaseEnd).toBeDefined();
        });
    });

    // ── Player action records ────────────────────────────────────────────────

    describe('OnCardPlayed', () => {
        it('emits a PLAY record', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const card = {
                setId: { set: 'SOR', number: 10 },
                printedType: 'basicUnit',
                zoneName: 'groundArena',
                isToken: () => false,
                title: 'Luke Skywalker',
            };
            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnCardPlayed, { card, player, playType: 'playFromHand' });

            const records = recorder.getRecords();
            const playRecord = records.find((r) => r.type === PgnActionType.Play);
            expect(playRecord).toBeDefined();
            expect(playRecord?.card).toBe('SOR#010');
            expect(playRecord?.player).toBe('P1');
        });

        it('emits PLAY_EVENT for event card type', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const card = {
                setId: { set: 'SOR', number: 5 },
                printedType: 'event',
                zoneName: 'hand',
                isToken: () => false,
                title: 'Shoot First',
            };
            game.emit(EventName.OnCardPlayed, { card, player: null, playType: 'playFromHand' });

            const records = recorder.getRecords();
            const eventRecord = records.find((r) => r.type === PgnActionType.PlayEvent);
            expect(eventRecord).toBeDefined();
        });

        it('emits PLAY_SMUGGLE for smuggle play type', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const card = {
                setId: { set: 'SHD', number: 20 },
                printedType: 'basicUnit',
                zoneName: 'groundArena',
                isToken: () => false,
                title: 'Smuggler',
            };
            game.emit(EventName.OnCardPlayed, { card, player: null, playType: 'smuggle' });

            const records = recorder.getRecords();
            const smuggleRecord = records.find((r) => r.type === PgnActionType.PlaySmuggle);
            expect(smuggleRecord).toBeDefined();
        });
    });

    describe('OnAttackDeclared', () => {
        it('emits an ATTACK record', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            recorder.initPlayerMap();
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const attacker = {
                setId: { set: 'SOR', number: 1 },
                isToken: () => false,
                title: 'AT-AT',
            };
            const defender = {
                setId: { set: 'SOR', number: 2 },
                printedType: 'basicUnit',
                isToken: () => false,
                title: 'X-Wing',
            };
            const attackingPlayer = { id: 'p1-id', name: 'Alice' };
            const attack = {
                attacker,
                attackingPlayer,
                getAllTargets: () => [defender],
                getDefendingPlayer: () => null,
            };
            game.emit(EventName.OnAttackDeclared, { attack });

            const records = recorder.getRecords();
            const attackRecord = records.find((r) => r.type === PgnActionType.Attack);
            expect(attackRecord).toBeDefined();
            expect(attackRecord?.attacker).toBe('SOR#001');
            expect(attackRecord?.defender).toBe('SOR#002');
            expect(attackRecord?.player).toBe('P1');
        });
    });

    describe('OnPassActionPhasePriority', () => {
        it('emits a PASS record', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            recorder.initPlayerMap();
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const player = { id: 'p2-id', name: 'Bob' };
            game.emit(EventName.OnPassActionPhasePriority, { player });

            const records = recorder.getRecords();
            const passRecord = records.find((r) => r.type === PgnActionType.Pass);
            expect(passRecord).toBeDefined();
            expect(passRecord?.player).toBe('P2');
        });
    });

    describe('OnClaimInitiative', () => {
        it('emits a CLAIM_INITIATIVE record', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnClaimInitiative, { player });

            const records = recorder.getRecords();
            const claimRecord = records.find((r) => r.type === PgnActionType.ClaimInitiative);
            expect(claimRecord).toBeDefined();
        });
    });

    // ── Sub-event records ────────────────────────────────────────────────────

    describe('OnDamageDealt', () => {
        it('emits a DAMAGE record with lettered seq after a top-level action', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            // Top-level attack
            const attacker = { setId: { set: 'SOR', number: 1 }, isToken: () => false, title: 'AT-AT' };
            const defender = { setId: { set: 'SOR', number: 2 }, isToken: () => false, title: 'X-Wing', remainingHp: 2 };
            const attack = { attacker, attackingPlayer: null, getAllTargets: () => [defender], getDefendingPlayer: () => null };
            game.emit(EventName.OnAttackDeclared, { attack });

            // Sub-event damage
            game.emit(EventName.OnDamageDealt, {
                card: defender,
                damageDealt: 3,
                damageSource: { attack: { attacker } },
                type: 'combat',
            });

            const records = recorder.getRecords();
            const damageRecord = records.find((r) => r.type === PgnActionType.Damage);
            expect(damageRecord).toBeDefined();
            expect(damageRecord?.seq).toMatch(/a$/); // should end with 'a' letter suffix
        });
    });

    describe('OnCardsDrawn', () => {
        it('emits a DRAW record', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            recorder.initPlayerMap();
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnCardsDrawn, { player, amount: 2 });

            const records = recorder.getRecords();
            const drawRecord = records.find((r) => r.type === PgnActionType.Draw);
            expect(drawRecord).toBeDefined();
            expect(drawRecord?.count).toBe(2);
            expect(drawRecord?.player).toBe('P1');
        });
    });

    describe('OnCardDefeated', () => {
        it('emits a DEFEAT record', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const card = { setId: { set: 'SOR', number: 3 }, isToken: () => false, title: 'X-Wing' };
            const attacker = { setId: { set: 'SOR', number: 1 }, isToken: () => false, title: 'AT-AT' };
            game.emit(EventName.OnCardDefeated, {
                card,
                defeatSource: { type: 'attack', attack: { attacker } },
            });

            const records = recorder.getRecords();
            const defeatRecord = records.find((r) => r.type === PgnActionType.Defeat);
            expect(defeatRecord).toBeDefined();
            expect(defeatRecord?.card).toBe('SOR#003');
            expect(defeatRecord?.defeatedBy).toBe('SOR#001');
        });
    });

    describe('OnDeckShuffled', () => {
        it('emits a SHUFFLE record', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            recorder.initPlayerMap();
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Setup });

            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnDeckShuffled, { player });

            const records = recorder.getRecords();
            const shuffleRecord = records.find((r) => r.type === PgnActionType.Shuffle);
            expect(shuffleRecord).toBeDefined();
            expect(shuffleRecord?.player).toBe('P1');
        });
    });

    describe('OnTakeControl', () => {
        it('emits a TAKE_CONTROL record', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            recorder.initPlayerMap();
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const card = { setId: { set: 'SOR', number: 7 }, isToken: () => false, title: 'AT-ST' };
            const newController = { id: 'p2-id', name: 'Bob' };
            game.emit(EventName.OnTakeControl, { card, newController });

            const records = recorder.getRecords();
            const tcRecord = records.find((r) => r.type === PgnActionType.TakeControl);
            expect(tcRecord).toBeDefined();
            expect(tcRecord?.player).toBe('P2');
        });
    });

    // ── Token card ID ────────────────────────────────────────────────────────

    describe('token card ID', () => {
        it('formats token cards as TOKEN:{name}', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const tokenCard = {
                isToken: () => true,
                title: 'Shield',
                zoneName: 'hand',
            };
            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnCardsDrawn, {
                player,
                cards: [tokenCard],
                amount: 1,
            });

            // The token itself being drawn doesn't use cardId, but we can test directly
            // by triggering OnCardExhausted with a token
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });
            game.emit(EventName.OnCardExhausted, { card: tokenCard });

            const records = recorder.getRecords();
            const exhaustRecord = records.find((r) => r.type === PgnActionType.Exhaust && r.card === 'TOKEN:Shield');
            expect(exhaustRecord).toBeDefined();
        });
    });

    // ── Error resilience ─────────────────────────────────────────────────────

    describe('error resilience', () => {
        it('does not throw when event has null/undefined fields', () => {
            const game = makeGame();
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            // All fields intentionally missing / null
            expect(() => game.emit(EventName.OnCardPlayed, { card: null, player: null })).not.toThrow();
            expect(() => game.emit(EventName.OnAttackDeclared, { attack: null })).not.toThrow();
            expect(() => game.emit(EventName.OnDamageDealt, {})).not.toThrow();
            expect(() => game.emit(EventName.OnCardDefeated, {})).not.toThrow();
        });

        it('continues recording after a bad event', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            // Bad event
            game.emit(EventName.OnCardPlayed, { card: null, player: null });

            // Good event after bad
            const player = { id: 'p1-id', name: 'Alice' };
            game.emit(EventName.OnCardsDrawn, { player, amount: 1 });

            const records = recorder.getRecords();
            const drawRecord = records.find((r) => r.type === PgnActionType.Draw);
            expect(drawRecord).toBeDefined();
        });
    });

    // ── Seq numbering ────────────────────────────────────────────────────────

    describe('seq numbering', () => {
        it('assigns incrementing action numbers in Action Phase', () => {
            const game = makeGame([
                { id: 'p1-id', name: 'Alice' },
                { id: 'p2-id', name: 'Bob' },
            ]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const player = { id: 'p1-id', name: 'Alice' };
            const card = { setId: { set: 'SOR', number: 1 }, printedType: 'basicUnit', zoneName: 'groundArena', isToken: () => false, title: 'Card1' };
            const card2 = { setId: { set: 'SOR', number: 2 }, printedType: 'basicUnit', zoneName: 'groundArena', isToken: () => false, title: 'Card2' };

            game.emit(EventName.OnCardPlayed, { card, player, playType: 'playFromHand' });
            game.emit(EventName.OnCardPlayed, { card: card2, player, playType: 'playFromHand' });

            const records = recorder.getRecords().filter((r) => r.type === PgnActionType.Play);
            expect(records[0].seq).toBe('R1.A.1');
            expect(records[1].seq).toBe('R1.A.2');
        });

        it('resets action counter on phase transition', () => {
            const game = makeGame([{ id: 'p1-id', name: 'Alice' }]);
            const recorder = new PgnReplayRecorder(game);
            game.emit(EventName.OnBeginRound, {});
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Action });

            const player = { id: 'p1-id', name: 'Alice' };
            const card = { setId: { set: 'SOR', number: 1 }, printedType: 'basicUnit', zoneName: 'groundArena', isToken: () => false, title: 'Card1' };
            game.emit(EventName.OnCardPlayed, { card, player, playType: 'playFromHand' });

            // Transition to Regroup
            game.emit(EventName.OnPhaseStarted, { phase: PhaseName.Regroup });

            // In Regroup phase, events use phaseEventCounter
            game.emit(EventName.OnCardsDrawn, { player, amount: 1 });

            const records = recorder.getRecords();
            const drawRecord = records.find((r) => r.type === PgnActionType.Draw);
            expect(drawRecord?.seq).toBe('R1.G.1');
        });
    });
});
