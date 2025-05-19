describe('Acolyte Of The Beyond', function() {
    integration(function(contextRef) {
        describe('Acolyte Of The Beyond\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['acolyte-of-the-beyond'],
                    },
                    player2: {
                        hand: ['vanquish', 'no-glory-only-results'],
                    },
                });
            });

            it('should create a Force token on attack', function () {
                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(false);
                context.player1.clickCard(context.acolyteOfTheBeyond);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBe(true);
            });

            it('should create a Force token when defeated', function () {
                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(false);
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.acolyteOfTheBeyond);

                expect(context.player1.hasTheForce).toBe(true);
            });

            it('should allow the opponent to create a Force token when defeated by No Glory Only Results', function () {
                const { context } = contextRef;

                expect(context.player2.hasTheForce).toBe(false);
                context.player1.passAction();
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.acolyteOfTheBeyond);

                expect(context.player2.hasTheForce).toBe(true);
            });
        });
    });
});