describe('Unmarked Credits', function () {
    integration(function (contextRef) {
        it('should create a Credit token for the player', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['unmarked-credits']
                }
            });

            const { context } = contextRef;

            // Neither player should have any credits initially
            expect(context.player1.credits).toBe(0);
            expect(context.player2.credits).toBe(0);

            context.player1.clickCard(context.unmarkedCredits);

            // Player 1 should gain a credit token
            expect(context.player1.credits).toBe(1);
            expect(context.player2.credits).toBe(0);
        });
    });
});