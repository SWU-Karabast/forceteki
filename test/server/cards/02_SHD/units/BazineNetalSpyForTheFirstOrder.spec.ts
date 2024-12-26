describe('Bazin Netal, Spy For The First Order', function() {
    integration(function(contextRef) {
        describe('Bazin Netal, Spy For The First Order\'s ability', function() {
            it('should show Opponent\'s hand, player should be able to discard one card from it and Opponent\'s should draw a card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bazine-netal#spy-for-the-first-order', 'karabast', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.bazineNetal, 'hand');
                    context.player2.passAction();
                };

                // Player looks at the opponent's hand and discards a card from it, opponent draws a card
                expect(context.player1.hand.length).toBe(3);
                context.player1.clickCard(context.bazineNetal);

                expect(context.getChatLogs(1)).toContain('Bazine Netal sees AT-ST and Waylay');
                expect(context.player1).toHavePassAbilityPrompt('Discard 1 of those cards');

                context.player1.clickPrompt('Discard 1 of those cards');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.waylay]);
                context.player1.clickCard(context.waylay);

                // Player discarded a card from the opponent's hand and opponent drew a card
                expect(context.player2.getCardsInZone('discard').length).toBe(1);
                expect(context.player2.hand.length).toBe(2);
                expect(context.waylay).toBeInZone('discard');
                expect(context.wampa).toBeInZone('hand');

                // Reset
                reset();

                // Player looks at the opponent's hand and decides not to discard a card from it
                context.player1.clickCard(context.bazineNetal);

                expect(context.getChatLogs(1)).toContain('Bazine Netal sees AT-ST and Wampa');
                expect(context.player1).toHavePassAbilityPrompt('Discard 1 of those cards');

                context.player1.clickPrompt('Pass');
                expect(context.player2.hand.length).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
