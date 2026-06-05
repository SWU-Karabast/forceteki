describe('Ferry Droid', function() {
    integration(function(contextRef) {
        it('should give 4 Advantage tokens when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ferry-droid'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ferryDroid);
            expect(context.player2).toBeActivePlayer();
            expect(context.ferryDroid).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage']);
        });
    });
});
