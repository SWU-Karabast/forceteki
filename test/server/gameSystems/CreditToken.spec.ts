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

            it('Can be defeated to reduce the cost of playing a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'kestro-city',
                        credits: 4,
                        resources: 5,
                        hand: ['captain-rex#lead-by-example']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.captainRex);
                expect(context.player1).toHavePrompt('Use Credit tokens for Captain Rex');
                expect(context.player1).toHaveExactPromptButtons([
                    'Select amount',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Select amount');

                // Should be able to choose from 1 to 4 credits
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 4 }, (x, i) => `${i + 1}`));
                context.player1.chooseListOption('4');

                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                expect(context.captainRex).toBeInZone('groundArena', context.player1);
            });

            it('Can be defeated to reduce the cost of an action ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 3,
                        resources: 2,
                        groundArena: ['disaffected-senator']
                    }
                });

                const { context } = contextRef;

                // Use action ability (2R to deal 2 damage to a base)
                context.player1.clickCard(context.disaffectedSenator);
                context.player1.clickPrompt('Deal 2 damage to a base.');
                context.player1.clickCard(context.p2Base);

                // Prompt to use credit tokens for action ability cost
                expect(context.player1).toHavePrompt('Use Credit tokens for Disaffected Senator');
                expect(context.player1).toHaveExactPromptButtons([
                    'Select amount',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Select amount');

                // Should be able to choose from 1 to 2 credits
                expect(context.player1).toHaveExactDropdownListOptions(['1', '2']);
                context.player1.chooseListOption('2');

                expect(context.player1.credits).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
