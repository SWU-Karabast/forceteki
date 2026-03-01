describe('Lady Proxima, Where\'s The Money?', function () {
    integration(function (contextRef) {
        it('Lady Proxima\'s action ability should exhaust to create a Credit token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['lady-proxima#wheres-the-money']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ladyProxima);
            expect(context.player1).toHaveEnabledPromptButton('Create a Credit token');
            context.player1.clickPrompt('Create a Credit token');

            expect(context.ladyProxima.exhausted).toBeTrue();
            expect(context.player1.credits).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Lady Proxima\'s action ability should not be usable when exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'lady-proxima#wheres-the-money', exhausted: true }]
                },
            });

            const { context } = contextRef;

            // Exhausted units can't use action abilities, should only be able to attack
            expect(context.ladyProxima).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
