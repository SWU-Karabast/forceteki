describe('Aggrieved Parliamentarian', function () {
    integration(function (contextRef) {
        it('Aggrieved Parliamentarian\'s ability should shuffle opponent discard pile and move them to the bottom of deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aggrieved-parliamentarian'],
                },
                player2: {
                    discard: ['battlefield-marine', 'wampa', 'atst', 'vigilance'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aggrievedParliamentarian);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.discard.length).toBe(0);

            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player2, 4);
            expect(context.wampa).toBeInBottomOfDeck(context.player2, 4);
            expect(context.atst).toBeInBottomOfDeck(context.player2, 4);
            expect(context.vigilance).toBeInBottomOfDeck(context.player2, 4);
        });
    });
});
