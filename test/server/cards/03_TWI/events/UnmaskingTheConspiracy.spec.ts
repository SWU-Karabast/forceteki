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

            // Check that the lookAt sends ALL the opponents cards in hand to chat
            expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);
            expect(context.getChatLogs(1)[0]).not.toContain(context.waylay.title);

            // Discards a card from the opponent's hand
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.waylay]);
            context.player1.clickCardInDisplayCardPrompt(context.atst);
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