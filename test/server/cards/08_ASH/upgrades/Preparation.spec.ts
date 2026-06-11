describe('Preparation', function() {
    integration(function(contextRef) {
        it('Prepration', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['preparation'],
                    groundArena: ['battlefield-marine'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.preparation);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });
    });
});
