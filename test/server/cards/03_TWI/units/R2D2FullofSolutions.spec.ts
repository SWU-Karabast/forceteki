describe('R2-D2, Full of Solutions', function() {
    integration(function(contextRef) {
        describe('R2-D2, Full of Solution\'s ability', function() {
            it('should be able to discard a card from hand to search the top 3 cards of your deck for a card to draw', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#full-of-solutions', 'entrenched', 'pyke-sentinel'],
                        deck: ['batch-brothers', 'perilous-position', 'battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Play R2 and discard a card
                context.player1.clickCard(context.r2d2);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.pykeSentinel]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.entrenched);
                expect(context.entrenched).toBeInZone('discard', context.player1);

                // Search the top 3 and draw one
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.batchBrothers, context.perilousPosition, context.battlefieldMarine]
                });
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

                // Verify the other 2 are not on top of the deck
                expect(context.player1.deck[0]).toBe(context.wampa);
            });

            it('should do nothing if the player\'s hand is empty after playing R2', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#full-of-solutions'],
                        deck: ['batch-brothers', 'perilous-position', 'battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Play R2D2 with no cards in hand and verify deck doesn't change
                context.player1.clickCard(context.r2d2);
                expect(context.player1.deck[0]).toBe(context.batchBrothers);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
