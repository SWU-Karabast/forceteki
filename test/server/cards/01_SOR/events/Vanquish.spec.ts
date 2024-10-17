describe('Vanquish', function() {
    integration(function(contextRef) {
        describe('Vanquish\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        groundArena: ['pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });
            });

            it('should defeat any non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.imperialInterceptor);
                expect(context.imperialInterceptor).toBeInLocation('discard');
            });
        });
    });
});
