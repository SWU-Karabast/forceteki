describe('Mandalorian Scout', function() {
    integration(function(contextRef) {
        it('should exhaust a friendly resource when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mandalorian-scout'],
                    resources: 5
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    hasInitiative: true,
                    resources: 10,
                    leader: 'iden-versio#inferno-squad-commander'
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.mandalorianScout);

            expect(context.player1.readyResourceCount).toBe(4);
            expect(context.player2.readyResourceCount).toBe(5);

            expect(context.player1).toBeActivePlayer();
        });

        it('should work with NGOR', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mandalorian-scout'],
                    resources: 5
                },
                player2: {
                    hand: ['vanquish', 'no-glory-only-results'],
                    hasInitiative: true,
                    resources: 10,
                    leader: 'iden-versio#inferno-squad-commander'
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.mandalorianScout);

            expect(context.player1.readyResourceCount).toBe(5);
            expect(context.player2.readyResourceCount).toBe(4);

            expect(context.player1).toBeActivePlayer();
        });
    });
});
