describe('Babwa Venomor, Burning Kashyyyk', function() {
    integration(function(contextRef) {
        it('Babwa Venomor\'s when played ability should create a Beast token for opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['babwa-venomor#burning-kashyyyk'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.babwaVenomor);

            expect(context.player2).toBeActivePlayer();
            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
            const beast = context.player2.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player2);
        });
    });
});
