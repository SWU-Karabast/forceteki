describe('501st Veteran', function() {
    integration(function(contextRef) {
        it('501st Veteran\'s while undamaged, it gains Sentinel', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['liberated-slaves', 'wampa']
                },
                player2: {
                    groundArena: ['501st-veteran']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.liberatedSlaves);
            expect(context.player1).toBeAbleToSelectExactly([context._501stVeteran]);
            context.player1.clickCard(context._501stVeteran);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context._501stVeteran, context.p2Base]);
            context.player1.clickCard(context.p2Base);
        });
    });
});
