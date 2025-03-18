describe('X Wing and TIE Fighter Tokens', function() {
    integration(function(contextRef) {
        it('Create a test for set 4 tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['xwing']
                },
                player2: {
                    spaceArena: ['tie-fighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.xwing);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.tieFighter);
            context.player2.clickCard(context.p1Base);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
