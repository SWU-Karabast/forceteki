import { parse } from '../../../swupgn/src/index';

// Game-end coverage on a REAL finished game (Plan-3 review gap #4). Every other integration spec
// stops mid-game, so the GAME_END event and the Result/Reason header fields were never validated
// against an actually-finished game. Here P1 destroys P2's base and we assert the emitted .swupgn
// records the win, the result, the reason, and a trailing GAME_END.
describe('SWU-PGN/1.0 generator — game end (real finished game)', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    base: { card: 'administrators-tower', damage: 29 },
                },
                // older-test compatibility: auto-pick the single legal target (the base)
                autoSingleTarget: true,
            });
        });

        it('records GAME_END (winner 1), Result "P1", and Reason "Base Destroyed"', function () {
            const { context } = contextRef;
            const game: any = context.game;

            // Wampa attacks the 1-HP base for lethal — this ends the game.
            context.player1.clickCard(context.wampa);
            expect(context.player1).toHavePrompt('player1 has won the game!');
            context.ignoreUnresolvedActionPhasePrompts = true;

            const text: string = game.getCachedSwuPgn();
            const doc = parse(text);

            expect(doc.header.result).toBe('P1');
            expect(doc.header.reason).toBe('Base Destroyed');

            const gameEnd = doc.events.find((e: any) => e.t === 'GAME_END');
            expect(gameEnd).toBeDefined();
            expect((gameEnd as any).winner).toBe(1);
            expect((gameEnd as any).reason).toBe('Base Destroyed');
        });
    });
});

describe('SWU-PGN/1.0 generator — game end won by seat 2', function () {
    integration(function (contextRef) {
        // Value: protects=a seat-2 win is GAME_END winner 2 and header Result "P2", read from one source; fails_when=the seat comparison is inverted or the header compares display names (every guest is AnonymousPlayer); why_new=every game-end spec has seat 1 win; seam=none; no_claim=a draw (both bases at once)
        it('records GAME_END (winner 2) and Result "P2" when player 2 wins', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'administrators-tower', damage: 29 },
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                },
                autoSingleTarget: true,
            });
            const { context } = contextRef;
            const game: any = context.game;

            context.player2.clickCard(context.wampa);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const doc = parse(game.getCachedSwuPgn());
            const gameEnd = doc.events.find((e: any) => e.t === 'GAME_END') as any;
            expect(gameEnd.winner).toBe(2);
            expect(doc.header.result).toBe('P2');
            expect(doc.header.reason).toBe(gameEnd.reason);
        });
    });
});
