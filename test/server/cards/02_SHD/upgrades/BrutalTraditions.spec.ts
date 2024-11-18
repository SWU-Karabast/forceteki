describe('Brutal Traditions', function() {
    integration(function(contextRef) {
        describe('Brutal Tradition\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                    }
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
    });
});
