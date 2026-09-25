describe('Admiral Holdo, We Are the Spark', () => {
    integration(function(contextRef) {
        describe('Her constant ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: ['sneak-attack', 'admiral-holdo#we-are-the-spark', 'clone'],
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'air-superiority',
                            'beguile',
                            'choose-sides',
                            'daring-raid',
                        ]
                    },
                    player2: {
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'apology-accepted',
                            'budget-scheming',
                            'change-of-heart',
                            'death-field',
                        ]
                    }
                });

                const { context } = contextRef;

                // Asign each expected draw card to a variable for easier access
                context.p1Draws = {
                    a: context.player1.findCardByName('air-superiority'),
                    b: context.player1.findCardByName('beguile'),
                    c: context.player1.findCardByName('choose-sides'),
                    d: context.player1.findCardByName('daring-raid'),
                };

                context.p2Draws = {
                    a: context.player2.findCardByName('apology-accepted'),
                    b: context.player2.findCardByName('budget-scheming'),
                    c: context.player2.findCardByName('change-of-heart'),
                    d: context.player2.findCardByName('death-field')
                };
            });

            it('draws 1 additional card during the regroup phase', function() {
                const { context } = contextRef;

                // Player 1 plays Admiral Holdo
                context.player1.clickCard(context.admiralHoldo);

                // Move to regroup phase to verify the draw effect
                context.moveToRegroupPhase();

                // Player 1 draws 3 cards
                expect([context.p1Draws.a, context.p1Draws.b, context.p1Draws.c]).toAllBeInZone('hand', context.player1);
                // Player 2 still draws the normal 2
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);

                // Undrawn cards remain in the deck
                expect([context.p1Draws.d]).toAllBeInZone('deck', context.player1);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('deck', context.player2);
            });

            it('shouldn\'t draw 1 more card during the regroup phase if she is defeated when it starts', function() {
                const { context } = contextRef;

                // Play Admiral Holdo using Sneak Attack
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.admiralHoldo);

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();

                // Admiral Holdo is defeated at the start of the regroup phase
                expect(context.admiralHoldo).toBeInZone('discard');

                // Both players draw the normal 2 cards
                expect([context.p1Draws.a, context.p1Draws.b]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);

                // Undrawn cards remain in the deck
                expect([context.p1Draws.c, context.p1Draws.d]).toAllBeInZone('deck', context.player1);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('deck', context.player2);
            });

            it('should stack the amount drawn if she is cloned', function() {
                const { context } = contextRef;

                // Play Admiral Holdo
                context.player1.clickCard(context.admiralHoldo);
                context.player2.passAction();

                // Clone Admiral Holdo
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.admiralHoldo);
                expect(context.clone).toBeCloneOf(context.admiralHoldo);

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();

                // Player 1 draws 4 cards, Player 2 draws the normal 2
                expect([context.p1Draws.a, context.p1Draws.b, context.p1Draws.c, context.p1Draws.d]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);

                // Undrawn cards remain in the deck
                expect(context.player1.deck.length).toBe(0);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('deck', context.player2);
            });

            it('Does not draw additional cards if her ability is removed', function() {
                const { context } = contextRef;

                // Play Admiral Holdo
                context.player1.clickCard(context.admiralHoldo);
                context.player2.passAction();

                // Remove Admiral Holdo's ability with Kazuda
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                context.player1.clickCard(context.admiralHoldo);
                context.player1.claimInitiative();

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();

                // Admiral Holdo has no abilities, so no additional cards are drawn
                expect([context.p1Draws.a, context.p1Draws.b]).toAllBeInZone('hand', context.player1);
                expect([context.p2Draws.a, context.p2Draws.b]).toAllBeInZone('hand', context.player2);

                // Undrawn cards remain in the deck
                expect([context.p1Draws.c, context.p1Draws.d]).toAllBeInZone('deck', context.player1);
                expect([context.p2Draws.c, context.p2Draws.d]).toAllBeInZone('deck', context.player2);
            });
        });
    });
});