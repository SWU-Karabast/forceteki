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

            it('should not take 2 damages when another card is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['royal-guard-attache', 'wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.royalGuardAttache);
                expect(context.royalGuardAttache.damage).toBe(2);
                context.player2.passAction();
                context.player1.clickCard(context.wampa);
                expect(context.royalGuardAttache.damage).toBe(2);
            });
        });
    });
});
