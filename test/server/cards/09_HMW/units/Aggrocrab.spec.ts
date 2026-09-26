describe('Aggrocrab', function() {
    integration(function(contextRef) {
        it('Aggrocrab\'s ability should make it cost 1 less while you have the initiative', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aggrocrab'],
                    hasInitiative: true,
                    base: 'tarkintown'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aggrocrab);

            // Aggrocrab costs 5, reduced to 4 while the player has the initiative
            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.aggrocrab).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });

        it('Aggrocrab\'s ability should not reduce its cost when the opponent has the initiative', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aggrocrab'],
                    base: 'tarkintown'
                },
                player2: {
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.passAction();
            context.player1.clickCard(context.aggrocrab);

            // Without the initiative, Aggrocrab costs its full 5 resources
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.aggrocrab).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
