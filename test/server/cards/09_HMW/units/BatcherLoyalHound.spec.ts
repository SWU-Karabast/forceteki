describe('Batcher, Loyal Hound', function() {
    integration(function(contextRef) {
        it('Batcher\'s ability should has +1/+0 while defending', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['batcher#loyal-hound']
                },
                player2: {
                    groundArena: ['gungi#finding-himself']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.batcher);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);

            context.player2.clickCard(context.gungi);
            context.player2.clickCard(context.batcher);

            expect(context.batcher.damage).toBe(2);
            expect(context.gungi.damage).toBe(3);
            expect(context.batcher.getPower()).toBe(2);
        });
    });
});
