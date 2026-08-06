describe('Ant Droid', function() {
    integration(function(contextRef) {
        it('Ant Droid\'s ability should draw a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ant-droid'],
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const startingHandSize = context.player1.hand.length;
            const startingDeckSize = context.player1.deck.length;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.antDroid);

            expect(context.player1.hand.length).toBe(startingHandSize + 1);
            expect(context.player1.deck.length).toBe(startingDeckSize - 1);
            expect(context.player1).toBeActivePlayer();
        });

        it('Ant Droid\'s ability opponent should draw a card when defeated with No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ant-droid']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const startingHandSize = context.player2.hand.length - 1; // No Glory Only Results is in hand
            const startingDeckSize = context.player2.deck.length;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.antDroid);

            expect(context.player2.hand.length).toBe(startingHandSize + 1);
            expect(context.player2.deck.length).toBe(startingDeckSize - 1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});