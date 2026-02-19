describe('Getaway Freighter', function() {
    integration(function(contextRef) {
        it('should create a Credit token when attacking and player has ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['getaway-freighter'],
                    groundArena: ['battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.getawayFreighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(1);
        });

        it('should not create Credit token when attacking and player has no ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['getaway-freighter']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.getawayFreighter);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(0);
        });
    });
});
