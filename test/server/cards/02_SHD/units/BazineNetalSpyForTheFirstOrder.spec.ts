describe('Bazin Netal, Spy For The First Order', function() {
    integration(function(contextRef) {
        describe('Bazin Netal, Spy For The First Order\'s ability', function() {
            it('should show Opponent\'s hand, player should be able to discard one card from it and Opponent\'s should draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bazine-netal#spy-for-the-first-order'],
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
                context.player1.clickCard(context.bazineNetal);

                // Cards are not revealed in chat
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.waylay.title);

                // Player sees the opponent's hand and is able to optionally discard a card from it
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    context.atst,
                    context.waylay
                ]);

                context.player1.clickCardInDisplayCardPrompt(context.waylay);

                // Player discarded a card from the opponent's hand and opponent drew a card
                expect(context.player2.getCardsInZone('discard').length).toBe(1);
                expect(context.player2.hand.length).toBe(2);
                expect(context.waylay).toBeInZone('discard');
                expect(context.wampa).toBeInZone('hand');

                // Reset state
                reset();

                // Player looks at the opponent's hand and decides not to discard a card from it
                context.player1.clickCard(context.bazineNetal);

                // Cards are not revealed in chat
                expect(context.getChatLogs(1)[0]).not.toContain(context.atst.title);
                expect(context.getChatLogs(1)[0]).not.toContain(context.wampa.title);

                // Player sees the opponent's hand and is able to optionally discard a card from it
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                    context.atst,
                    context.wampa
                ]);

                context.player1.clickPrompt('Take nothing');
                expect(context.player2.hand.length).toBe(2);
                expect(context.player2.discard.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be skipped as Opponent does not have any cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bazine-netal#spy-for-the-first-order'],
                    },
                    player2: {
                        deck: ['wampa']
                    }
                });
                const { context } = contextRef;

                // Player plays Bazine Netal but opponent does not have any cards in hand
                context.player1.clickCard(context.bazineNetal);

                expect(context.getChatLogs(1)).toContain('player1 plays Bazine Netal');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
