describe('Plot keyword', function() {
    integration(function(contextRef) {
        describe('When a leader is deployed', function() {
            it('a Plot upgrade may be played from resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cal-kestis#i-cant-keep-hiding',
                        resources: ['sneaking-suspicion', 'wampa', 'wampa', 'wampa'],
                        deck: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.calKestis);
                context.player1.clickPrompt('Deploy Cal Kestis');
                expect(context.player1).toHavePassAbilityPrompt('Play Sneaking Suspicion using Plot');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.calKestis]);
                context.player1.clickCard(context.calKestis);
                expect(context.sneakingSuspicion).toBeAttachedTo(context.calKestis);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.pykeSentinel).toBeInZone('resource');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
