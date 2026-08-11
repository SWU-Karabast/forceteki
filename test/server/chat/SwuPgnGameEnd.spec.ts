import { parse } from '../../../swupgn/src/index';

// Game-end coverage on a REAL finished game (Plan-3 review gap #4). Every other integration spec
// stops mid-game, so the GAME_END event and the Result/Reason header fields were never validated
// against an actually-finished game. Here P1 destroys P2's base and we assert the emitted .swupgn
// records the win, the result, the reason, and a trailing GAME_END.
describe('SWU-PGN/1.1 generator — game end (real finished game)', function () {
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
