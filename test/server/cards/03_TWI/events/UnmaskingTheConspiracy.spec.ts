describe('Unmasking the Conspiracy', function() {
    integration(function(contextRef) {
        it('Unmasking The Conspiracy\'s ability should prompt player to discard a random card to look at the opponent\'s hand and discard a card from it', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['unmasking-the-conspiracy', 'battlefield-marine'],
                },
                player2: {
                    hand: ['atst', 'waylay'],
                }
            });

            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.unmaskingTheConspiracy, 'hand');
                context.player2.passAction();
            };

            // Player discards a card and looks at the opponent's hand
            context.player1.clickCard(context.unmaskingTheConspiracy);

            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.getChatLogs(1)).toContain('Unmasking the Conspiracy sees AT-ST and Waylay');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.waylay]);

            // Discards a card from the opponent's hand
            context.player1.clickCard(context.atst);
            expect(context.atst).toBeInZone('discard');
            expect(context.player2.hand.length).toBe(1);

            // Reset
            reset();

            // Player does not have a card to discard and does not looks at the opponent's hand to discard a card from it
            context.player1.clickCard(context.unmaskingTheConspiracy);

            expect(context.player1.hand.length).toBe(0);
            expect(context.player2.hand.length).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});