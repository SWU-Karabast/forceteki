describe('Cat and Mouse', function () {
    integration(function (contextRef) {
        describe('Cat and Mouse\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cat-and-mouse'],
                        groundArena: [{ card: 'wampa', exhausted: true }, { card: 'r2d2#artooooooooo', exhausted: true }],
                        spaceArena: [{ card: 'tieln-fighter', exhausted: true }],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['imperial-interceptor'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should exhaust an enemy unit and ready a friendly unit in the same arena with power less than equal of that unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.catAndMouse);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor, context.sabineWren]);
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toBeAbleToSelectExactly([context.r2d2]);
                context.player1.clickCard(context.r2d2);

                expect(context.player2).toBeActivePlayer();
                expect(context.sabineWren.exhausted).toBeTrue();
                expect(context.r2d2.exhausted).toBeFalse();
            });

            it('should exhaust an enemy unit and not ready a friendly unit because enemy unit was already exhausted', function () {
                const { context } = contextRef;

                context.exhaustCard(context.sabineWren);

                context.player1.clickCard(context.catAndMouse);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor, context.sabineWren]);
                context.player1.clickCard(context.sabineWren);

                // as we choose an exhausted unit, nothing happens

                expect(context.player2).toBeActivePlayer();
                expect(context.sabineWren.exhausted).toBeTrue();
                expect(context.r2d2.exhausted).toBeTrue();
            });
        });
    });
});
