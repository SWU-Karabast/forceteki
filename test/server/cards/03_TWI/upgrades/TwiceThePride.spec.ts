describe('Twice The Pride', function() {
    integration(function(contextRef) {
        describe('Twice The Pride\'s ability', function() {
            it('should deal 2 damage to attached unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['twice-the-pride'],
                        groundArena: ['anakin-skywalker#maverick-mentor']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.twiceThePride);
                context.player1.clickCard(context.anakinSkywalker);

                expect(context.player2).toBeActivePlayer();
                expect(context.anakinSkywalker.damage).toBe(2);
            });
        });
    });
});
