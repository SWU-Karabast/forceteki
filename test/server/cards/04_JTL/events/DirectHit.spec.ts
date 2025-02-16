describe('Direct Hit', function() {
    integration(function(contextRef) {
        it('Direct Hit\'s ability should defeat any non-leader Vehicle unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['direct-hit'],
                    groundArena: ['pyke-sentinel', 'atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['imperial-interceptor'],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.directHit);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);

            context.player1.clickCard(context.imperialInterceptor);
            expect(context.imperialInterceptor).toBeInZone('discard');

            // TODO: test with attached Pilot leader
        });
    });
});
