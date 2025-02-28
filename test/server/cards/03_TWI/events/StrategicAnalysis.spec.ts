describe('Strategic Analysis', function() {
    integration(function(contextRef) {
        it('Strategic Analysis\' ability should draw 3 cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['strategic-analysis'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.strategicAnalysis);
            expect(context.player1.hand.length).toBe(3);
        });
    });
});
