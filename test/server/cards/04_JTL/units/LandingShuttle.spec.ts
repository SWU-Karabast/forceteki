describe('Landing Shuttle', function() {
    integration(function(contextRef) {
        it('Landing Shuttle\'s ability should draw a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['landing-shuttle']
                },
                player2: {
                    spaceArena: ['resupply-carrier']
                }
            });

            const { context } = contextRef;

            const startingHandSize = context.player1.hand.length;
            const startingDeckSize = context.player1.deck.length;

            context.player1.clickCard(context.landingShuttle);
            context.player1.clickCard(context.resupplyCarrier);

            expect(context.player1).toHavePassAbilityPrompt('Draw a card');

            context.player1.clickPrompt('Draw a card');

            expect(context.player1.hand.length).toBe(startingHandSize + 1);
            expect(context.player1.deck.length).toBe(startingDeckSize - 1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});