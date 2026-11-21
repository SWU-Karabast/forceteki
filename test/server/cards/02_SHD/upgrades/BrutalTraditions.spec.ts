describe('Brutal Traditions', function() {
    integration(function(contextRef) {
        describe('Brutal Tradition\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'atst',
                            'moisture-farmer',
                            'death-trooper'
                        ],
                        discard: ['brutal-traditions']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['confiscate', 'vanquish']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should be able to play it from the discard pile when an opponent\'s unit is defeated.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();
                expect(context.player1).toBeAbleToSelect(context.brutalTraditions);
                expect(context.player1.currentActionTargets).toContain(context.brutalTraditions);

                context.player1.clickCard(context.brutalTraditions);
                context.player1.clickCard(context.atst);
                expect(context.atst.upgrades).toEqual([context.brutalTraditions]);

                // Brutal tradition is again able to be played from the discard pile
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.atst);

                expect(context.brutalTraditions).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelect(context.brutalTraditions);
                expect(context.player1.currentActionTargets).toContain(context.brutalTraditions);

                context.player1.clickCard(context.brutalTraditions);
                context.player1.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer.upgrades).toEqual([context.brutalTraditions]);

                // remove it with confiscate
                context.player2.clickCard(context.confiscate);
                expect(context.brutalTraditions).toBeInZone('discard');
                expect(context.player1.currentActionTargets).toContain(context.brutalTraditions);

                // CASE 2: Should not be able to be played in the next turn.
                context.moveToNextActionPhase();

                expect(context.player1).toBeActivePlayer();
                expect(context.player1).not.toBeAbleToSelect(context.brutalTraditions);
            });
        });

        it('should be able to play it from the discard pile when a friendly unit was taken and defeated by the opponent with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst', 'wampa'],
                    discard: ['brutal-traditions']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            expect(context.player1).not.toBeAbleToSelect(context.brutalTraditions);

            // AT-ST is defeated while player2 controls it, so it counts as an enemy unit for player1
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.atst);
            expect(context.atst).toBeInZone('discard', context.player1);

            expect(context.player1).toBeAbleToSelect(context.brutalTraditions);
            context.player1.clickCard(context.brutalTraditions);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toHaveExactUpgradeNames(['brutal-traditions']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
