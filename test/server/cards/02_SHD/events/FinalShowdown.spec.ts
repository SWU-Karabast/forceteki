describe('Final Showdown', function() {
    integration(function(contextRef) {
        it('Final Showdown\'s event ability should make you lose the game at the start of the next regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['final-showdown'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true, exhausted: true },
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    spaceArena: [{ card: 'tie-advanced', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'gor#grievouss-pet', exhausted: true }],
                },
            });

            const { context } = contextRef;

            expect(context.grandMoffTarkin.exhausted).toBe(true);
            expect(context.battlefieldMarine.exhausted).toBe(true);
            expect(context.tieAdvanced.exhausted).toBe(true);
            expect(context.gor.exhausted).toBe(true);

            // Player 1 plays Final Showdown
            context.player1.clickCard(context.finalShowdown);

            expect(context.grandMoffTarkin.exhausted).toBe(false);
            expect(context.battlefieldMarine.exhausted).toBe(false);
            expect(context.tieAdvanced.exhausted).toBe(false);
            expect(context.gor.exhausted).toBe(true);

            // Move to the next regroup phase
            context.moveToRegroupPhase();

            // Player 1 should have lost the game
            expect(context.game.winner).toEqual([context.player2Name]);
        });

        it('Final Showdown\'s event ability should ready all friendly units and allow you to win this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['final-showdown'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true, exhausted: true },
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    spaceArena: [{ card: 'tie-advanced', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'gor#grievouss-pet', exhausted: true }],
                    base: { card: 'echo-base', damage: 28 },
                },
            });

            const { context } = contextRef;

            expect(context.grandMoffTarkin.exhausted).toBe(true);
            expect(context.battlefieldMarine.exhausted).toBe(true);
            expect(context.tieAdvanced.exhausted).toBe(true);
            expect(context.gor.exhausted).toBe(true);

            // Player 1 plays Final Showdown
            context.player1.clickCard(context.finalShowdown);

            expect(context.grandMoffTarkin.exhausted).toBe(false);
            expect(context.battlefieldMarine.exhausted).toBe(false);
            expect(context.tieAdvanced.exhausted).toBe(false);
            expect(context.gor.exhausted).toBe(true);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 attacks with Tie Advanced
            context.player1.clickCard(context.tieAdvanced);
            context.player1.clickCard(context.p2Base);

            // Player 1 should have won the game
            expect(context.game.winner).toEqual([context.player1Name]);

            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');
        });
    });
});
