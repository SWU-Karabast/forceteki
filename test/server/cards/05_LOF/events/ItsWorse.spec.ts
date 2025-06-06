describe('It\'s Worse', function() {
    integration(function(contextRef) {
        it('It\'s Worse\'s ability should defeat any non-leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['its-worse'],
                    groundArena: ['pyke-sentinel']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['imperial-interceptor'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.itsWorse);
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.imperialInterceptor]);

            context.player1.clickCard(context.imperialInterceptor);
            expect(context.imperialInterceptor).toBeInZone('discard');
        });
    });
});
