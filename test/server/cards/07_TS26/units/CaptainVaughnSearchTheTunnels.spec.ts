describe('Captain Vaughn, Search the Tunnels', function() {
    integration(function(contextRef) {
        describe('Captain Vaughn\'s When Defeated ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['captain-vaughn#seatch-the-tunnels'],
                        hand: ['pyke-sentinel'],
                        deck: ['batch-brothers', 'perilous-position', 'battlefield-marine', 'wampa']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });
            });

            it('should search the top 3 cards for a card to draw, then put a card from hand on top of deck', function() {
                const { context } = contextRef;

                // Defeat Captain Vaughn
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.captainVaughn);

                // Search the top 3 cards and draw one
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.batchBrothers, context.perilousPosition, context.battlefieldMarine]
                });

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

                // Then put a card from hand on top of deck
                expect(context.player1).toHavePrompt('Put a card from your hand on top of your deck');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('deck', context.player1);
                expect(context.player1.deck[0]).toBe(context.pykeSentinel);

                expect(context.player1).toBeActivePlayer();
            });

            it('should be optional to draw from the deck, but still put a card from hand on top of deck', function() {
                const { context } = contextRef;

                // Defeat Captain Vaughn
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.captainVaughn);

                // Take nothing from deck search
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.batchBrothers, context.perilousPosition, context.battlefieldMarine]
                });
                context.player1.clickPrompt('Take nothing');

                // Then put a card from hand on top of deck
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('deck', context.player1);
                expect(context.player1.deck[0]).toBe(context.pykeSentinel);

                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Captain Vaughn\'s When Defeated ability should handle having fewer than 3 cards in deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-vaughn#seatch-the-tunnels'],
                    hand: ['pyke-sentinel'],
                    deck: ['batch-brothers', 'perilous-position']
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Defeat Captain Vaughn
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.captainVaughn);

            // Search shows only 2 cards
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.batchBrothers, context.perilousPosition]
            });
            context.player1.clickCardInDisplayCardPrompt(context.batchBrothers);
            expect(context.batchBrothers).toBeInZone('hand', context.player1);

            // Then put a card from hand on top of deck
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.batchBrothers]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeInZone('deck', context.player1);
            expect(context.player1.deck[0]).toBe(context.pykeSentinel);

            expect(context.player1).toBeActivePlayer();
        });

        it('Captain Vaughn\'s When Defeated ability should still put a card on top of the deck when deck is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-vaughn#seatch-the-tunnels'],
                    hand: ['pyke-sentinel'],
                    deck: []
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Defeat Captain Vaughn
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.captainVaughn);

            // Put a card from hand on top of deck
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeInZone('deck', context.player1);
            expect(context.player1.deck[0]).toBe(context.pykeSentinel);

            // Player1 should have 0 damage on base
            expect(context.player1.base.damage).toBe(0);

            expect(context.player1).toBeActivePlayer();
        });
    });
});