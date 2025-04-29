describe('Scythe, Intimidating Silhouette', function() {
    integration(function(contextRef) {
        it('Scythe\'s ability may give +2/+0 to another friendly Inquisitor unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['fifth-brother#fear-hunter', 'wampa'],
                    spaceArena: ['scythe#intimidating-silhouette'],
                },
                player2: {
                    groundArena: ['seventh-sister#implacable-inquisitor'],
                }
            });

            const { context } = contextRef;

            expect(context.scimitar.getPower()).toBe(3);
            expect(context.scimitar.getHp()).toBe(4);

            context.player1.clickCard(context.scythe);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.fithBrother]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.fithBrother);
            expect(context.player2).toBeActivePlayer();
            expect(context.fithBrother.getPower()).toBe(4);
            expect(context.fithBrother.getHp()).toBe(4);
        });
    });
});