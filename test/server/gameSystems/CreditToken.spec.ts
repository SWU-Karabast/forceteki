describe('Credit token', function () {
    integration(function(contextRef) {
        describe('The basics of the Credit token: ', function () {
            it('it is intialiazed for each player based on the test setup', async function () {
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

            it('it can be adjusted through the player interaction wrapper', async function () {
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
        });

        describe('Using Credit tokens to pay costs: ', function () {
            it('it can be defeated to reduce the cost of playing a card by 1 per credit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 1,
                        resources: 4,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 1 Credit',
                    'Pay costs without Credit tokens',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Use 1 Credit');

                // Credit token was defeated, 3 resources were spent
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('it can be defeated to reduce the cost of an action ability by 1 per credit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 3,
                        resources: {
                            readyCount: 0,
                            exhaustedCount: 3,
                        },
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
                    'Use 2 Credits',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Use 2 Credits');

                // 2 credit tokens were defeated, base took 2 damage
                expect(context.player1.credits).toBe(1);
                expect(context.p2Base.damage).toBe(2);
            });

            it('the action can be cancelled before costs are paid', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 1,
                        resources: 4,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 1 Credit',
                    'Pay costs without Credit tokens',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Cancel');

                // Credit tokens were not defeated, no resources were spent, card is still in hand, still P1's turn
                expect(context.player1.credits).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.consularSecurityForce).toBeInZone('hand');
                expect(context.player1).toBeActivePlayer();
            });

            it('can be bypassed to pay costs without using credit tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 1,
                        resources: 4,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 1 Credit',
                    'Pay costs without Credit tokens',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Pay costs without Credit tokens');

                // No credit tokens were defeated, 4 resources were spent
                expect(context.player1.credits).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('when costs cannot be paid without credit tokens, the option to pay without them is not given', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 1,
                        resources: 3,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 1 Credit',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Use 1 Credit');

                // Credit token was defeated, 3 resources were spent
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('player is given a valid range of credits to use when multiple amounts are possible', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 6,
                        resources: 2,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Select amount',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Select amount');

                // Should be able to choose from 2 to 4 credits, despite having 6 available
                expect(context.player1).toHaveExactDropdownListOptions(['2', '3', '4']);
                context.player1.chooseListOption('3');

                // 3 credit tokens were defeated, 1 resource was spent
                expect(context.player1.credits).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('if exactly one amount of credits can be used, that amount is offered directly', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        credits: 2,
                        resources: 2,
                        hand: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Play Consular Security Force (4R)
                context.player1.clickCard(context.consularSecurityForce);

                // Prompt to use credit tokens for playing the card
                expect(context.player1).toHavePrompt('Use Credit tokens for Consular Security Force');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 2 Credits',
                    'Cancel'
                ]);
                context.player1.clickPrompt('Use 2 Credits');

                // 2 credit tokens were defeated, 2 resources were spent
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });
        });
    });
});
