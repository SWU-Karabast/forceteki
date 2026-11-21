describe('Han Solo, Gamblin\' Man', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s When Played ability', function() {
            const searchPrompt = 'Select a card to draw';

            it('should search the top 10 cards for a card to draw, then discard a random card from hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man', 'wampa'],
                        deck: [
                            'atst',
                            'cartel-spacer',
                            'alliance-xwing',
                            'rebel-pathfinder',
                            'batch-brothers',
                            'perilous-position',
                            'pyke-sentinel',
                            'vanquish',
                            'consular-security-force',
                            'battlefield-marine',
                            'waylay'
                        ]
                    }
                });

                const { context } = contextRef;

                // Seed the RNG so the random discard is deterministic
                context.game.setRandomSeed('12345');

                // Play Han Solo, search prompt shows only the top 10 cards
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHavePrompt(searchPrompt);
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.atst,
                        context.cartelSpacer,
                        context.allianceXwing,
                        context.rebelPathfinder,
                        context.batchBrothers,
                        context.perilousPosition,
                        context.pykeSentinel,
                        context.vanquish,
                        context.consularSecurityForce,
                        context.battlefieldMarine
                    ]
                });
                expect(context.waylay).toBeInZone('deck', context.player1);

                // Draw Vanquish, then a random card is discarded from hand
                context.player1.clickCardInDisplayCardPrompt(context.vanquish);
                expect(context.vanquish).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.discard.length).toBe(1);

                // The 11th card was not searched and remains on top of the deck
                expect(context.player1.deck[0]).toBe(context.waylay);
                expect(context.player1.deck.length).toBe(10);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to randomly discard the card it just drew', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man'],
                        deck: ['atst', 'cartel-spacer', 'alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Play Han Solo and draw A-TST
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHavePrompt(searchPrompt);
                context.player1.clickCardInDisplayCardPrompt(context.atst);

                // A-TST is the only card in hand, so it is discarded
                expect(context.atst).toBeInZone('discard', context.player1);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.discard.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still discard a random card from hand if nothing is taken', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man', 'wampa'],
                        deck: ['atst', 'cartel-spacer', 'alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Play Han Solo and take nothing
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHavePrompt(searchPrompt);
                context.player1.clickPrompt('Take nothing');

                // Wampa is discarded and the deck is untouched
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.deck.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should handle having fewer than 10 cards in deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man', 'wampa'],
                        deck: ['atst', 'cartel-spacer', 'alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Seed the RNG so the random discard is deterministic
                context.game.setRandomSeed('12345');

                // Play Han Solo, search prompt shows the whole deck
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHavePrompt(searchPrompt);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.atst,
                        context.cartelSpacer,
                        context.allianceXwing
                    ]
                });

                // Draw Cartel Spacer, then a random card is discarded from hand
                context.player1.clickCardInDisplayCardPrompt(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player1.discard.length).toBe(1);
                expect(context.player1.deck.length).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });

            it('should still discard a random card from hand when the deck is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man', 'wampa'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Play Han Solo, there is nothing to search so no prompt appears
                context.player1.clickCard(context.hanSolo);

                // Wampa is discarded
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player1.base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should discard nothing if the hand is empty and nothing is taken', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['han-solo#gamblin-man'],
                        deck: ['atst', 'cartel-spacer', 'alliance-xwing']
                    }
                });

                const { context } = contextRef;

                // Play Han Solo and take nothing
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHavePrompt(searchPrompt);
                context.player1.clickPrompt('Take nothing');

                // Hand and discard are both empty
                expect(context.player1.discard.length).toBe(0);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
