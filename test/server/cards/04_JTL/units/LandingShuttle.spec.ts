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

            context.player1.clickPrompt('Trigger');

            expect(context.player1.hand.length).toBe(startingHandSize + 1);
            expect(context.player1.deck.length).toBe(startingDeckSize - 1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Landing Shuttle\'s ability should draw a card for the new controller when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['landing-shuttle']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            const p1HandSize = context.player1.hand.length;
            const p1DeckSize = context.player1.deck.length;
            const p2DeckSize = context.player2.deck.length;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.landingShuttle);

            // player2 controlled Landing Shuttle when it was defeated, so player2 draws
            expect(context.player2).toHavePassAbilityPrompt('Draw a card');
            context.player2.clickPrompt('Trigger');

            expect(context.player2.hand.length).toBe(1);
            expect(context.player2.deck.length).toBe(p2DeckSize - 1);
            expect(context.player1.hand.length).toBe(p1HandSize);
            expect(context.player1.deck.length).toBe(p1DeckSize);
            expect(context.landingShuttle).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
