describe('Trade Federation Delegates', function() {
    integration(function(contextRef) {
        it('should create 2 Spy tokens when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trade-federation-delegates']
                }
            });

            const { context } = contextRef;

            // Play the unit
            context.player1.clickCard(context.tradeFederationDelegates);

            // Verify 2 Spy tokens were created under player1's control, in ground, and exhausted
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();

            // No enemy cards were affected
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
