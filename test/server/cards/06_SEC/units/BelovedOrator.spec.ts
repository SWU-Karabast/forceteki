describe('Beloved Orator', function() {
    integration(function(contextRef) {
        it('Beloved Orator\'s when played ability should create a Spy token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['beloved-orator'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.belovedOrator);

            expect(context.player2).toBeActivePlayer();

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
        });
    });
});
