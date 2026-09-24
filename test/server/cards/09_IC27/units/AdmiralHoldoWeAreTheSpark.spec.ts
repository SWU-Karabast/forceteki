describe('Admiral Holdo, We Are the Spark', () => {
    integration(function(contextRef) {
        describe('Triggered ability', function() {
            it('draws 1 more card during the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['admiral-holdo#we-are-the-spark']
                    }
                });

                const { context } = contextRef;

                // Start with no cards in hand
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2.hand.length).toBe(0);

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();

                // Ability should trigger and let P1 draw 3 cards instead of 2
                expect(context.player1.hand.length).toBe(3);
                expect(context.player2.hand.length).toBe(2);
            });

            it('shouldn\'t draw 1 more card during the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'sneak-attack', 'admiral-holdo#we-are-the-spark']
                    },
                    player2: {
                        hand: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Start with no cards in hand
                expect(context.player1.hand.length).toBe(3);
                expect(context.player2.hand.length).toBe(1);

                context.player1.clickCard('sneak-attack');
                context.player1.clickCard(context.admiralHoldo);

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();
                context.player1.clickCard('battlefield-marine');
                context.player2.clickCard('battlefield-marine');

                // Ability shouldn't get triggered because Holdo is already defeated
                expect(context.player1.hand.length).toBe(2);
                expect(context.player2.hand.length).toBe(2);
            });
        });
    });
});