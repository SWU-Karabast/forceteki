describe('Every Day, More Lies', function () {
    integration(function (contextRef) {
        it('should make each player to discard a card from their hands', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['every-day-more-lies', 'battlefield-marine', 'vanquish'],
                },
                player2: {
                    hand: ['wampa', 'atst', 'fell-the-dragon']
                }
            });

            const { context } = contextRef;

            // Player 1 plays Every Day, More Lies
            context.player1.clickCard(context.everyDayMoreLies);
            expect(context.player1).toHavePrompt('Choose a card to discard for Every Day, More Lies\'s effect');

            // Player 1 discards a card
            expect(context.player1).toBeAbleToSelectExactly(['battlefield-marine', 'vanquish']);
            context.player1.clickCard(context.battlefieldMarine);

            // Player 2 discards a card
            expect(context.player2).toHavePrompt('Choose a card to discard for Every Day, More Lies\'s effect');
            expect(context.player2).toBeAbleToSelectExactly(['wampa', 'atst', 'fell-the-dragon']);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');
            expect(context.battlefieldMarine).toBeInZone('discard');

            // Expect Player 2 to be active player
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be played even if player has no other cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['every-day-more-lies'],
                },
                player2: {
                    hand: ['wampa', 'atst', 'fell-the-dragon']
                }
            });

            const { context } = contextRef;

            // Player 1 plays Every Day, More Lies
            context.player1.clickCard(context.everyDayMoreLies);

            // Player 2 discards a card
            expect(context.player2).toHavePrompt('Choose a card to discard for Every Day, More Lies\'s effect');
            expect(context.player2).toBeAbleToSelectExactly(['wampa', 'atst', 'fell-the-dragon']);
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard');

            // Expect Player 2 to be active player
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be played even if any player has no other cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['every-day-more-lies'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Every Day, More Lies
            context.player1.clickCard(context.everyDayMoreLies);

            // Expect Player 2 to be active player
            expect(context.player2).toBeActivePlayer();
        });
    });
});