describe('Rotunda Senate Guards', function() {
    integration(function(contextRef) {
        it('Rotunda Senate Guards\'s while undamaged, it gains Sentinel', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['liberated-slaves', 'wampa']
                },
                player2: {
                    groundArena: ['rotunda-senate-guards']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.liberatedSlaves);
            expect(context.player1).toBeAbleToSelectExactly([context.rotundaSenateGuards]);
            context.player1.clickCard(context.rotundaSenateGuards);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.rotundaSenateGuards, context.p2Base]);
            context.player1.clickCard(context.p2Base);
        });
    });
});
