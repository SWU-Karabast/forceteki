describe('The Desolation of Hoth', function() {
    integration(function(contextRef) {
        describe('when played', function() {
            it('should allow defeating up to 2 enemy units that cost 3 or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-desolation-of-hoth'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'wampa', 'admiral-piett#captain-of-the-executor']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDesolationOfHoth);

                // Should only be able to select units that cost 3 or less
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.admiralPiett]);
                expect(context.player1).not.toBeAbleToSelect(context.wampa);

                // Select first target
                context.player1.clickCard(context.pykeSentinel);

                // Should be able to select another target or done
                expect(context.player1).toBeAbleToSelect(context.admiralPiett);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // Select second target
                context.player1.clickCard(context.admiralPiett);
                context.player1.clickPrompt('Done')

                // Both targets should be defeated
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.admiralPiett).toBeInZone('discard', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });

            it('should allow defeating only 1 unit if desired', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-desolation-of-hoth'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'wampa', 'admiral-piett#captain-of-the-executor']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDesolationOfHoth);

                // Select only one target
                context.player1.clickCard(context.pykeSentinel);

                // Choose to be done instead of selecting a second target
                context.player1.clickPrompt('Done');

                // Only the selected target should be defeated
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.admiralPiett).toBeInZone('groundArena', context.player2);
            });

            it('should work when there is only 1 valid target', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-desolation-of-hoth'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDesolationOfHoth);

                // Should only be able to select the unit that costs 3 or less
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);

                // Select the target
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                // Target should be defeated
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });

            it('should do nothing when there are no valid targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-desolation-of-hoth'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDesolationOfHoth);
                context.player1.clickPrompt('Play anyway');

                // No valid targets, so nothing should happen
                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });

            it('should be able to target units in both arenas', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-desolation-of-hoth'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['tieln-fighter']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.theDesolationOfHoth);

                // Should be able to select units in both arenas
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.tielnFighter]);

                // Select one from each arena
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickPrompt('Done');

                // Both targets should be defeated
                expect(context.pykeSentinel).toBeInZone('discard', context.player2);
                expect(context.tielnFighter).toBeInZone('discard', context.player2);
            });
        });
    });
});