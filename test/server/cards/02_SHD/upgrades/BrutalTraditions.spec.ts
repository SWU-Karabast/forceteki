describe('Brutal Traditions', function() {
    integration(function(contextRef) {
        describe('Brutal Tradition\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'vigilant-honor-guards', upgrades: ['brutal-traditions'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['confiscate']
                    }
                });
            });

            it('should be able to play it from the discard pile when an opponent\'s unit is defeated.', function () {
                const { context } = contextRef;
                // CASE 1: Play it from the discard pile when removed with confiscate
                context.player1.clickCard(context.vigilantHonorGuards);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInLocation('discard');

                context.player2.clickCard(context.confiscate);

                expect(context.brutalTraditions).toBeInLocation('discard');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelect(context.brutalTraditions);

                context.player1.clickCard(context.brutalTraditions);
                expect(context.vigilantHonorGuards.upgrades).toEqual([context.brutalTraditions]);
                expect(context.vigilantHonorGuards.getPower()).toBe(5);
                expect(context.vigilantHonorGuards.getHp()).toBe(8);
            });

            it('should not be able to play it from the discard pile.', function () {
                const { context } = contextRef;
                // CASE 1: Play it from the discard pile when removed with confiscate
                context.player1.passAction();
                context.player2.clickCard(context.confiscate);

                expect(context.player1).toBeActivePlayer();
                expect(context.player1).not.toBeAbleToSelect(context.brutalTraditions);
            });
        });
    });
});
