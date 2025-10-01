describe('The Wrong Ride', function () {
    integration(function (contextRef) {
        it('The Wrong Ride\'s ability should exhaust 2 enemy resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-wrong-ride', 'battlefield-marine'],
                    base: { card: 'chopper-base' },
                    resources: 7
                },
                player2: {
                    resources: 5
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theWrongRide);
            expect(context.player2.readyResourceCount).toBe(3);
        });
    });
});