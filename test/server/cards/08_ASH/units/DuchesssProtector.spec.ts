describe('Duchess\'s Protector', function() {
    integration(function(contextRef) {
        it('should create an exhausted Mandalorian token in its controller\'s ground arena when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['duchesss-protector'],
                },
                player2: {
                    hand: ['vanquish'],
                    resources: 10,
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.duchesssProtector);

            expect(context.duchesssProtector).toBeInZone('discard', context.player1);

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians[0]).toBeInZone('groundArena', context.player1);
            expect(mandalorians[0].exhausted).toBeTrue();

            expect(context.player1).toBeActivePlayer();
        });

        it('should create an exhausted Mandalorian token for the opponent when defeated with No Glory Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['duchesss-protector'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.duchesssProtector);

            expect(context.duchesssProtector).toBeInZone('discard', context.player1);

            const mandalorians = context.player2.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians[0]).toBeInZone('groundArena', context.player2);
            expect(mandalorians[0].exhausted).toBeTrue();

            expect(context.player1).toBeActivePlayer();
        });
    });
});
