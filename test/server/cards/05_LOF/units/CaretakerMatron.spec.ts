describe('Caretaker Matron', function () {
    integration(function (contextRef) {
        it('Caretaker Matron\'s ability  should allow drawing a card when a Force trait card has been played this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['yoda#old-master'],
                    groundArena: ['caretaker-matron'],
                    deck: ['wampa']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.yoda);
            context.player2.passAction();

            // Record initial hand size
            const initialHandSize = context.player1.hand.length;

            // Use Caretaker Matron's ability
            context.player1.clickCard(context.caretakerMatron);
            context.player1.clickPrompt('Draw a card');

            // Verify the unit is exhausted
            expect(context.caretakerMatron.exhausted).toBe(true);

            // Verify a card was drawn
            expect(context.player1.hand.length).toBe(initialHandSize + 1);
        });

        it('Caretaker Matron\'s ability should not allow drawing a card when no Force trait card has been played this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    groundArena: ['caretaker-matron'],
                    deck: ['atst']
                },
                player2: {
                    hand: ['yoda#old-master'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player2.clickCard(context.yoda);

            // Record initial hand size
            const initialHandSize = context.player1.hand.length;

            // Use Caretaker Matron's ability
            context.player1.clickCard(context.caretakerMatron);
            context.player1.clickPrompt('Draw a card');
            context.player1.clickPrompt('Use it anyway');

            // Verify the unit is exhausted
            expect(context.caretakerMatron.exhausted).toBeTrue();

            // Verify no card was drawn
            expect(context.player1.hand.length).toBe(initialHandSize);
        });
    });
});