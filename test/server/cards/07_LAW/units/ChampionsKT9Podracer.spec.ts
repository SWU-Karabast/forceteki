describe('Champion\'s KT9 Podracer', function () {
    integration(function (contextRef) {
        it('should create a Credit token when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['champions-kt9-podracer']
                }
            });

            const { context } = contextRef;

            // Neither player should have any credits initially
            expect(context.player1.credits).toBe(0);
            expect(context.player2.credits).toBe(0);

            context.player1.clickCard(context.championsKt9Podracer);

            // Player 1 should gain a credit token
            expect(context.player1.credits).toBe(1);
            expect(context.player2.credits).toBe(0);

            expect(context.getChatLog()).toEqual('player1 uses Champion\'s KT9 Podracer to create a Credit token');

            expect(context.championsKt9Podracer).toBeInZone('groundArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});