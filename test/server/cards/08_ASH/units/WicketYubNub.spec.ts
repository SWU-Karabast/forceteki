describe('Wicket, Yub Nub', function() {
    integration(function(contextRef) {
        it('Wicket cannot attack base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wicket#yub-nub'],
                },
                player2: {
                    groundArena: ['porg', 'echo-base-defender']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wicket);
            expect(context.player1).toBeAbleToSelectExactly([context.porg, context.echoBaseDefender]);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
        });
    });
});