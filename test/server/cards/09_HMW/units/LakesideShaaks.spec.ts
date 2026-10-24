describe('Lakeside Shaaks', function() {
    integration(function(contextRef) {
        it('Lakeside Shaaks\' ability should ready a friendly resource', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lakeside-shaaks'],
                    leader: 'cad-bane#he-who-needs-no-introduction'
                },
            });

            const { context } = contextRef;

            context.player2.exhaustResources(2);

            context.player1.clickCard(context.lakesideShaaks);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player2.exhaustedResourceCount).toBe(2);
        });
    });
});