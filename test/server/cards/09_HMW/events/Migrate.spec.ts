describe('Migrate', function() {
    integration(function(contextRef) {
        it('Migrates\'s ability should create a Beast token for every 3 resources they control', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['migrate'],
                    resources: 10
                },
                player2: {
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.migrate);

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardsByName('beast');
            expect(p1Beast.length).toBe(3);

            const p2Beast = context.player2.findCardsByName('beast');
            expect(p2Beast.length).toBe(0);
        });
    });
});