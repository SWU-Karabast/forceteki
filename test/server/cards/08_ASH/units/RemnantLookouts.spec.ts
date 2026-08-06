describe('Remnant Lookouts', function() {
    integration(function(contextRef) {
        describe('Remnant Lookouts\'s ability', function() {
            it('should show Opponent\'s hand, player should be able to discard one card from it and Opponent\'s should draw a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['remnant-lookouts'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.remnantLookouts, 'hand');
                    context.player2.passAction();
                };

                // Player looks at the opponent's hand and discards a card from it, opponent draws a card
                context.player1.clickCard(context.remnantLookouts);

                // Cards are revealed in chat
                expect(context.getChatLogs(1)[0]).toContain(context.atst.title);
                expect(context.getChatLogs(1)[0]).toContain(context.waylay.title);
                expect(context.getChatLogs(1)).toEqual([
                    'player1 uses Remnant Lookouts to look at the opponent\'s hand and sees AT-ST and Waylay',
                ]);

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
                context.player1.clickCard(context.remnantLookouts);

                // Cards are revealed in chat
                expect(context.getChatLogs(1)[0]).toEqual(
                    'player1 uses Remnant Lookouts to look at the opponent\'s hand and sees AT-ST and Wampa',
                );

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
                        hand: ['remnant-lookouts'],
                    },
                    player2: {
                        deck: ['wampa']
                    }
                });
                const { context } = contextRef;

                // Player plays Remnant Lookouts but opponent does not have any cards in hand
                context.player1.clickCard(context.remnantLookouts);

                expect(context.getChatLogs(1)).toContain('player1 plays Remnant Lookouts');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to choose nothing', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['remnant-lookouts'],
                    },
                    player2: {
                        hand: ['atst', 'waylay'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.remnantLookouts);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                expect(context.player2.hand.length).toBe(2);
                expect(context.remnantLookouts).toBeInZone('groundArena');
            });
        });
    });
});