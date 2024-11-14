describe('Brutal Traditions', function() {
    integration(function(contextRef) {
        describe('Brutal Tradition\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'vigilant-honor-guards', upgrades: ['brutal-traditions'] }, { card: 'moisture-farmer' }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['confiscate', 'vanquish']
                    }
                });
            });

            it('should be able to play it from the discard pile when an opponent\'s unit is defeated.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vigilantHonorGuards);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInLocation('discard');

                context.player2.clickCard(context.confiscate);
                expect(context.brutalTraditions).toBeInLocation('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelect(context.brutalTraditions);

                context.player1.clickCard(context.brutalTraditions);
                context.player1.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards.upgrades).toEqual([context.brutalTraditions]);
                expect(context.vigilantHonorGuards.getPower()).toBe(5);
                expect(context.vigilantHonorGuards.getHp()).toBe(8);
                expect(context.vigilantHonorGuards.damage).toBe(4);

                // Brutal tradition is again able to be played from the discard pile
                context.player2.clickCard(context.vanquish);
                expect(context.player2).toBeAbleToSelect(context.vigilantHonorGuards);
                context.player2.clickCard(context.vigilantHonorGuards);
                expect(context.vigilantHonorGuards).toBeInLocation('discard');

                expect(context.brutalTraditions).toBeInLocation('discard');
                expect(context.player1).toBeAbleToSelect(context.brutalTraditions);

                context.player1.clickCard(context.brutalTraditions);
                expect(context.moistureFarmer.upgrades).toEqual([context.brutalTraditions]);
            });
        });
    });
});
