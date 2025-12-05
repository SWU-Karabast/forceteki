describe('Credit token', function () {
    integration(function(contextRef) {
        describe('The basics of the Credit token', function () {
            it('Is intialiazed for each player based on the test setup', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 3
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;

                // Check that counts are correct
                expect(context.player1.credits).toBe(3);
                expect(context.player2.credits).toBe(1);

                // Check that tokens are in the correct zone
                const p1CreditTokens = context.player1.findCardsByName('credit');
                const p2CreditTokens = context.player2.findCardsByName('credit');

                for (const token of p1CreditTokens) {
                    expect(token).toBeInZone('base', context.player1);
                }

                for (const token of p2CreditTokens) {
                    expect(token).toBeInZone('base', context.player2);
                }
            });

            it('Can be adjusted through the player interaction wrapper', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action'
                });

                const { context } = contextRef;

                // Initial count should be zero
                expect(context.player1.credits).toBe(0);

                // Add some credit tokens
                context.player1.setCreditTokenCount(5);
                expect(context.player1.credits).toBe(5);

                // Remove some credit tokens
                context.player1.setCreditTokenCount(2);
                expect(context.player1.credits).toBe(2);
            });

            it('Can be defeated to pay costs', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        credits: 4,
                        hand: ['hyperspace-wayfarer']
                    }
                });

                const { context } = contextRef;

                // Play the Hyperspace Wayfarer (6 cost)
                context.player1.clickCard(context.hyperspaceWayfarer);

                // Check that credit tokens were defeated to pay part of the cost
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // Check that the unit is in play
                expect(context.hyperspaceWayfarer).toBeInZone('spaceArena', context.player1);
            });
        });
    });
});
