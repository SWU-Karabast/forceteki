describe('Chio Fain, Four-Armed Slicer', function() {
    integration(function(contextRef) {
        describe('Chio Fain\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['chio-fain#fourarmed-slicer'],
                        deck: ['vanquish', 'resupply']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: ['overwhelming-barrage', 'repair']
                    }
                });
            });

            it('should optionally let both players draw a card when attacking', function () {
                const { context } = contextRef;

                const player1HandSizeBefore = context.player1.handSize;
                const player2HandSizeBefore = context.player2.handSize;

                context.player1.clickCard(context.chioFain);
                context.player1.clickCard(context.p2Base);

                // Ability is optional
                expect(context.player1).toHavePassAbilityPrompt('Both players draw a card');
                context.player1.clickPrompt('Trigger');

                // Both players should have drawn a card
                expect(context.player1.handSize).toBe(player1HandSizeBefore + 1);
                expect(context.vanquish).toBeInZone('hand', context.player1);
                expect(context.player2.handSize).toBe(player2HandSizeBefore + 1);
                expect(context.overwhelmingBarrage).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass the ability', function () {
                const { context } = contextRef;

                const player1HandSizeBefore = context.player1.handSize;
                const player2HandSizeBefore = context.player2.handSize;

                context.player1.clickCard(context.chioFain);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                // Neither player should have drawn a card
                expect(context.player1.handSize).toBe(player1HandSizeBefore);
                expect(context.player2.handSize).toBe(player2HandSizeBefore);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should work when one player has an empty deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['chio-fain#fourarmed-slicer'],
                    deck: ['vanquish']
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            const player1HandSizeBefore = context.player1.handSize;
            const player2HandSizeBefore = context.player2.handSize;

            context.player1.clickCard(context.chioFain);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            // Player 1 should have drawn a card, player 2 could not draw
            expect(context.player1.handSize).toBe(player1HandSizeBefore + 1);
            expect(context.vanquish).toBeInZone('hand', context.player1);
            expect(context.player2.handSize).toBe(player2HandSizeBefore);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
