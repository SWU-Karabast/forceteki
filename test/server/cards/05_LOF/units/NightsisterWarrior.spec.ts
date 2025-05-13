describe('Nightsister Warrior', function() {
    integration(function(contextRef) {
        it('Nightsister Warrior\'s ability should draw a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['nightsister-warrior'],
                },
                player2: {
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            const startingHandSize = context.player1.hand.length;
            const startingDeckSize = context.player1.deck.length;

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.nightsisterWarrior);

            expect(context.player1).toHavePassAbilityPrompt('Draw a card');

            context.player1.clickPrompt('Trigger');

            expect(context.player1.hand.length).toBe(startingHandSize + 1);
            expect(context.player1.deck.length).toBe(startingDeckSize - 1);
            expect(context.player1).toBeActivePlayer();
        });

        it('Nightsister Warrior\'s ability opponent should draw a card when defeated with No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['nightsister-warrior']
                },
                player2: {
                    hand: ['no-glory-only-results']
                }
            });

            const { context } = contextRef;

            const startingHandSize = context.player2.hand.length - 1; // No Glory Only Results is in hand
            const startingDeckSize = context.player2.deck.length;

            context.player1.passAction();
            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.nightsisterWarrior);

            expect(context.player2).toHavePassAbilityPrompt('Draw a card');

            context.player2.clickPrompt('Trigger');

            expect(context.player2.hand.length).toBe(startingHandSize + 1);
            expect(context.player2.deck.length).toBe(startingDeckSize - 1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});