describe('Royal Guard Attaché', function () {
    integration(function (contextRef) {
        describe('Royal Guard Attaché\'s ability', function () {
            it('should take 2 damages when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['royal-guard-attache'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.royalGuardAttache);
                expect(context.royalGuardAttache.damage).toBe(2);
            });
        });
    });
});
