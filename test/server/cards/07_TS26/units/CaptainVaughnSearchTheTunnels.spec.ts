describe('Captain Vaughn, Search the Tunnels', function() {
    integration(function(contextRef) {
        describe('Captain Vaughn\'s When Defeated ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['captain-vaughn#search-the-tunnels'],
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
                    groundArena: ['captain-vaughn#search-the-tunnels'],
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
                    groundArena: ['captain-vaughn#search-the-tunnels'],
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

        it('Captain Vaughn\'s When Defeated ability should search the deck of the player who controlled him when defeated by No Glory, Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['captain-vaughn#search-the-tunnels'],
                    hand: ['atst'],
                    deck: ['cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'wampa']
                },
                player2: {
                    hand: ['no-glory-only-results', 'pyke-sentinel'],
                    deck: ['batch-brothers', 'perilous-position', 'battlefield-marine', 'consular-security-force'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.captainVaughn);

            // player2 controlled Captain Vaughn when he was defeated, so player2 searches their own deck
            expect(context.player2).toHaveExactDisplayPromptCards({
                selectable: [context.batchBrothers, context.perilousPosition, context.battlefieldMarine]
            });
            context.player2.clickCardInDisplayCardPrompt(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('hand', context.player2);

            // Then player2 puts a card from their own hand on top of their deck
            expect(context.player2).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine]);
            context.player2.clickCard(context.pykeSentinel);
            expect(context.player2.deck[0]).toBe(context.pykeSentinel);

            expect(context.captainVaughn).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.player1.deck.length).toBe(4);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
