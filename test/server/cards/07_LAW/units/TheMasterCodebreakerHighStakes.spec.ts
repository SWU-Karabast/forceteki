describe('The Master Codebreaker, High Stakes', function () {
    integration(function (contextRef) {
        describe('The Master Codebreaker\'s When Played ability', function () {
            it('should search the top 8 cards of the deck and allow selecting and drawing a Gambit card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        // Top 8 cards of deck
                        deck: [
                            'battlefield-marine',
                            'wampa',
                            'second-chance', // Gambit card
                            'protector',
                            'inferno-four#unforgetting',
                            'devotion',
                            'consular-security-force',
                            'final-showdown', // Gambit card
                            'superlaser-technician'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                // Verify deck search display prompt shows Gambit cards as selectable
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.secondChance, context.finalShowdown],
                    invalid: [context.battlefieldMarine, context.wampa, context.protector, context.infernoFour, context.devotion, context.consularSecurityForce]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.secondChance);

                // Verify the Gambit card was drawn
                expect(context.secondChance).toBeInZone('hand');

                // Verify other cards were moved to bottom of deck
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.finalShowdown).toBeInBottomOfDeck(context.player1, 7);

                expect(context.theMasterCodebreaker).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow taking nothing if no Gambit cards are in the top 8', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: [
                            'battlefield-marine',
                            'wampa',
                            'sabine-wren#explosives-artist',
                            'protector',
                            'inferno-four#unforgetting',
                            'devotion',
                            'consular-security-force',
                            'echo-base-defender'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                // Verify the "Take nothing" button appears when no Gambit cards are found
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.theMasterCodebreaker).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should move cards not selected to the bottom of the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-master-codebreaker#high-stakes'],
                        deck: [
                            'battlefield-marine',
                            'wampa',
                            'eject', // Gambit card
                            'protector',
                            'inferno-four#unforgetting',
                            'devotion',
                            'consular-security-force',
                            'echo-base-defender',
                            'superlaser-technician',
                            'atst'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMasterCodebreaker);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.eject],
                    invalid: [context.battlefieldMarine, context.wampa, context.protector, context.infernoFour, context.devotion, context.consularSecurityForce, context.echoBaseDefender]
                });

                context.player1.clickCardInDisplayCardPrompt(context.eject);

                // Verify the Gambit card was drawn
                expect(context.eject).toBeInZone('hand');

                // Verify other cards from top 8 were moved to bottom of deck (7 cards since 1 was drawn)
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
                expect(context.wampa).toBeInBottomOfDeck(context.player1, 7);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 7);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 7);
                expect(context.devotion).toBeInBottomOfDeck(context.player1, 7);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 7);

                // Verify the 9th and 10th cards remain in deck but not at bottom
                expect(context.superlaserTechnician).toBeInZone('deck', context.player1);
                expect(context.atst).toBeInZone('deck', context.player1);

                expect(context.theMasterCodebreaker).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Master Codebreaker\'s constant ability', function () {
            // Note: These tests are skipped because the Gambit trait may not be properly set on cards in the database yet.
            // Once second-chance, final-showdown, and eject have the Gambit trait added to the card data, these tests can be enabled.
            xit('should reduce the cost of the first Gambit card played each phase by 1', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes', 'wampa'],
                        hand: ['second-chance'] // Gambit upgrade, costs 3
                    }
                });

                const { context } = contextRef;

                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.wampa);

                // Second Chance costs 3, should cost 2 with discount
                expect(context.player1.readyResourceCount).toBe(readyResourceCount - 2);
                expect(context.player2).toBeActivePlayer();
            });

            xit('should only reduce the cost of the first Gambit card, not subsequent ones', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-master-codebreaker#high-stakes', exhausted: true }, { card: 'wampa', exhausted: true }],
                        hand: ['final-showdown', 'second-chance'], // Final Showdown costs 6, Second Chance costs 3
                        resources: 15
                    }
                });

                const { context } = contextRef;

                // Play first Gambit card (Final Showdown) - should cost 1 less
                context.player1.clickCard(context.finalShowdown);
                expect(context.player1.readyResourceCount).toBe(10); // Costs 5 instead of 6
                expect(context.theMasterCodebreaker.exhausted).toBeFalse(); // Units were readied
                expect(context.wampa.exhausted).toBeFalse();

                context.player2.passAction();

                // Play second Gambit card (Second Chance) - should cost full price
                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.wampa);
                expect(context.player1.readyResourceCount).toBe(readyResourceCount - 3); // Costs 3 (no discount)

                expect(context.player2).toBeActivePlayer();
            });

            xit('should not reduce the cost of non-Gambit cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes'],
                        hand: ['battlefield-marine'] // Cost 2, not a Gambit card
                    }
                });

                const { context } = contextRef;

                const readyResourceCount = context.player1.readyResourceCount;
                context.player1.clickCard(context.battlefieldMarine);

                // Should cost full price (2 resources)
                expect(context.player1.readyResourceCount).toBe(readyResourceCount - 2);
                expect(context.player2).toBeActivePlayer();
            });

            xit('should reset the discount each phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-master-codebreaker#high-stakes', exhausted: true }, { card: 'wampa', exhausted: true }, { card: 'battlefield-marine', exhausted: true }],
                        hand: ['final-showdown', 'second-chance'], // Final Showdown costs 6, Second Chance costs 3
                        resources: 15
                    }
                });

                const { context } = contextRef;

                // Play first Gambit card this phase - should get discount
                context.player1.clickCard(context.finalShowdown);
                expect(context.player1.readyResourceCount).toBe(10); // Costs 5 instead of 6

                // Move to next action phase
                context.moveToNextActionPhase();

                // Play second Gambit card in new phase - should get discount again
                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.wampa);
                expect(context.player1.readyResourceCount).toBe(9); // Costs 2 instead of 3 (discount applies again)

                expect(context.player2).toBeActivePlayer();
            });

            xit('should NOT apply discount when Master Codebreaker is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-master-codebreaker#high-stakes', 'wampa'],
                        hand: ['second-chance'],
                        resources: 10
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Master Codebreaker
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theMasterCodebreaker);

                expect(context.theMasterCodebreaker).toBeInZone('discard');

                // Play Gambit card - should NOT get discount since Master Codebreaker is no longer in play
                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.wampa);
                expect(context.player1.readyResourceCount).toBe(7); // Costs 3 (no discount)

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should have 1 power and 4 HP and cost 2', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-master-codebreaker#high-stakes']
                }
            });

            const { context } = contextRef;

            expect(context.theMasterCodebreaker.getPower()).toBe(1);
            expect(context.theMasterCodebreaker.getHp()).toBe(4);
            expect(context.theMasterCodebreaker.printedCost).toBe(2);
        });
    });
});
