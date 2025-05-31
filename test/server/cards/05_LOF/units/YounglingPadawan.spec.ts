describe('Youngling Padawan', function() {
    integration(function(contextRef) {
        describe('Youngling Padawan\'s ability', function() {
            it('should create a Force token when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['youngling-padawan'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);
                context.player1.clickCard(context.younglingPadawan);
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
            });
        });
    });
});