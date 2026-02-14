describe('Canto Bight Security', function() {
    integration(function(contextRef) {
        describe('Canto Bight Security\'s ability', function() {
            it('should create a Credit token when defending', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['canto-bight-security'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.cantoBightSecurity);

                expect(context.player2).toBeActivePlayer();
                expect(context.player2.credits).toBe(1);
            });

            it('should only trigger when actually defending (not when attacking)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['canto-bight-security'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.cantoBightSecurity);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
            });
        });
    });
});
