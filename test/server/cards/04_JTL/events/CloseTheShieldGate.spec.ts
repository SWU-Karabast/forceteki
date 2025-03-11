describe('Close the Shield Gate', function() {
    integration(function(contextRef) {
        xit('Close the Shield Gate\'s ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['close-the-shield-gate'],
                    base: { card: 'dagobah-swamp', damage: 1 }
                },
                player2: {
                    hand: ['daring-raid']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.closeTheShieldGate);
            context.player1.clickCard(context.p1Base);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(1);
        });
    });
});
