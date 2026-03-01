describe('Windfall', function () {
    integration(function (contextRef) {
        it('should create 3 Credit token for the player', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['windfall']
                }
            });

            const { context } = contextRef;

            // Neither player should have any credits initially
            expect(context.player1.credits).toBe(0);
            expect(context.player2.credits).toBe(0);

            context.player1.clickCard(context.windfall);

            // Player 1 should gain 3 credit token
            expect(context.player1.credits).toBe(3);
            expect(context.player2.credits).toBe(0);
        });
    });
});