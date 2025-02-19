describe('Profundity, We Fight!', function() {
    integration(function(contextRef) {
        it('Profundity\'s when player and when defeated ability should make a player discard a card and then another card if they have more cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['onyx-squadron-brute', 'profundity#we-fight'],
                },
                player2: {
                    hand: ['vanquish', 'battlefield-marine', 'wampa', 'atst', 'clone-dive-trooper'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Profundity
            context.player1.clickCard(context.profundity);

            // Player 1 chooses opponent to discard a card
            expect(context.player1).toHavePrompt('Choose a player to discard a card from their hand');
            context.player1.clickPrompt('Opponent');

            // Player 2 discards a card
            expect(context.player2).toHavePrompt('Choose a card to discard');
            expect(context.player2).toBeAbleToSelectExactly([
                context.vanquish,
                context.battlefieldMarine,
                context.wampa,
                context.atst,
                context.cloneDiveTrooper,
            ]);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');

            // Then, they have to discard a second card
            expect(context.player2).toHavePrompt('Choose a card to discard');
            expect(context.player2).toBeAbleToSelectExactly([
                context.vanquish,
                context.wampa,
                context.atst,
                context.cloneDiveTrooper,
            ]);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');

            // Player 2 defeats Profundity
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.profundity);

            // Player 1 chooses opponent to discard a card
            expect(context.player1).toHavePrompt('Choose a player to discard a card from their hand');
            context.player1.clickPrompt('Opponent');

            // Player 2 discards a card
            expect(context.player2).toBeAbleToSelectExactly([
                context.atst,
                context.cloneDiveTrooper,
            ]);
            context.player2.clickCard(context.atst);
            expect(context.atst).toBeInZone('discard');

            // Then, they don't have to discard a second card
            expect(context.player1).toBeActivePlayer();
        });

        it('Profundity\'s when player and when defeated ability should always discard a single card when targeting self', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'wampa', 'atst', 'profundity#we-fight'],
                },
                player2: {
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Profundity
            context.player1.clickCard(context.profundity);

            // Player 1 chooses self to discard a card
            expect(context.player1).toHavePrompt('Choose a player to discard a card from their hand');
            context.player1.clickPrompt('You');

            // Player 1 discards a card
            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.wampa,
                context.atst,
            ]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');

            // Then, they don't have to discard a second card
            expect(context.player2).toBeActivePlayer();

            // Player 2 defeats Profundity
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.profundity);

            // Player 1 chooses opponent to discard a card
            expect(context.player1).toHavePrompt('Choose a player to discard a card from their hand');
            context.player1.clickPrompt('You');

            // Player 1 discards a card
            expect(context.player1).toBeAbleToSelectExactly([
                context.atst,
                context.wampa,
            ]);
            context.player1.clickCard(context.atst);
            expect(context.atst).toBeInZone('discard');

            // Then, they don't have to discard a second card
            expect(context.player1).toBeActivePlayer();
        });
    });
});
