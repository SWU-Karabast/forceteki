describe('Cloaked StarViper', function() {
    integration(function(contextRef) {
        it('Cloaked StarViper\'s ability should give itself 2 shield', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cloaked-starviper'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cloakedStarviper);

            expect(context.player2).toBeActivePlayer();
            expect(context.cloakedStarviper).toHaveExactUpgradeNames(['shield', 'shield']);
        });
    });
});
