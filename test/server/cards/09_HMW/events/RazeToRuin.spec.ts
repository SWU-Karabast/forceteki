describe('Raze to Ruin', function() {
    integration(function(contextRef) {
        describe('Raze to Ruin\'s ability', function() {
            const discardTwoCardsPrompt = 'Choose 2 cards to discard for Raze to Ruin\'s effect';
            const discardOneCardPrompt = 'Choose a card to discard for Raze to Ruin\'s effect';

            it('should only remove the event card from hand and not prompt either player to discard when both have 3 or fewer cards in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raze-to-ruin', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['underworld-thug']
                    }
                });

                const { context } = contextRef;
                const p1HandSizeBeforeEvent = context.player1.handSize;
                const p2HandSizeBeforeEvent = context.player2.handSize;

                // Play Raze to Ruin
                context.player1.clickCard(context.razeToRuin);

                // Neither player is prompted to discard
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(p1HandSizeBeforeEvent - 1);
                expect(context.player2.handSize).toBe(p2HandSizeBeforeEvent);
            });

            it('should prompt the controller to discard down to 3 cards, then the opponent, when both have more than 3 cards in hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raze-to-ruin', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Play Raze to Ruin
                context.player1.clickCard(context.razeToRuin);

                expect(context.player1.handSize).toBe(5);
                expect(context.player2.handSize).toBe(4);

                // Controller discards down to 3 cards
                expect(context.player1).toHavePrompt(discardTwoCardsPrompt);
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                context.player1.hand.slice(0, 2).forEach((card) => context.player1.clickCard(card));
                context.player1.clickDone();

                // Opponent discards down to 3 cards
                expect(context.player2).toHavePrompt(discardOneCardPrompt);
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);
                context.player2.clickCard(context.player2.hand[0]);

                // Both hands end at 3 cards
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(3);
                expect(context.player2.handSize).toBe(3);
                expect(context.getChatLogs(3)).toContain(
                    'player1 plays Raze to Ruin to make themself discard 2 cards and to make player2 discard a card'
                );
            });

            it('should only prompt the player with more than 3 cards to discard', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raze-to-ruin', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Play Raze to Ruin
                context.player1.clickCard(context.razeToRuin);

                // Only the opponent, who has more than 3 cards, is prompted to discard
                expect(context.player2).toHavePrompt(discardTwoCardsPrompt);
                expect(context.player2).toBeAbleToSelectExactly(context.player2.hand);
                context.player2.hand.slice(0, 2).forEach((card) => context.player2.clickCard(card));
                context.player2.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(3);
            });

            it('should use singular phrasing in the discard prompt when a player must discard exactly 1 card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raze-to-ruin', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Play Raze to Ruin
                context.player1.clickCard(context.razeToRuin);

                // Controller must discard exactly 1 card
                expect(context.player1).toHavePrompt(discardOneCardPrompt);
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                context.player1.clickCard(context.player1.hand[0]);

                expect(context.player1.handSize).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should use plural phrasing in the discard prompt when a player must discard exactly 2 cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['raze-to-ruin', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug']
                    },
                    player2: {
                        hand: ['underworld-thug']
                    }
                });

                const { context } = contextRef;

                // Play Raze to Ruin
                context.player1.clickCard(context.razeToRuin);

                // Controller must discard exactly 2 cards
                expect(context.player1).toHavePrompt(discardTwoCardsPrompt);
                expect(context.player1).toBeAbleToSelectExactly(context.player1.hand);
                context.player1.hand.slice(0, 2).forEach((card) => context.player1.clickCard(card));
                context.player1.clickDone();

                expect(context.player1.handSize).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
