describe('Galactic Escalation', function() {
    integration(function(contextRef) {
        it('should resource the top card of both players\' decks', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galactic-escalation'],
                    deck: ['confiscate', 'restock']
                },
                player2: {
                    deck: ['vanquish', 'repair']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galacticEscalation);

            // Top cards of each player's deck should be resourced
            expect(context.confiscate).toBeInZone('resource', context.player1);
            expect(context.vanquish).toBeInZone('resource', context.player2);

            // Event goes to discard, and second cards remain in deck
            expect(context.galacticEscalation).toBeInZone('discard');
            expect(context.restock).toBeInZone('deck', context.player1);
            expect(context.repair).toBeInZone('deck', context.player2);
            expect(context.player2).toBeActivePlayer();

            // Verify chat logs
            expect(context.getChatLogs(1)).toContain('player1 plays Galactic Escalation to move a card to their resources and to move the top card of player2\'s deck to their resources');
        });

        it('should resource only opponent\'s top card when the player has an empty deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galactic-escalation'],
                    deck: []
                },
                player2: {
                    deck: ['vanquish', 'repair']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galacticEscalation);

            // Only P2 gets a resource
            expect(context.vanquish).toBeInZone('resource', context.player2);

            // Event goes to discard, and second card remains in deck
            expect(context.galacticEscalation).toBeInZone('discard');
            expect(context.repair).toBeInZone('deck', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should resource only the player\'s top card when opponent has an empty deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galactic-escalation'],
                    deck: ['confiscate', 'restock']
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galacticEscalation);

            // Only P1 gets a resource
            expect(context.confiscate).toBeInZone('resource', context.player1);

            // Event goes to discard, and second cards remain in deck
            expect(context.galacticEscalation).toBeInZone('discard');
            expect(context.restock).toBeInZone('deck', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should warn that the event will have no effect when both players have empty decks', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galactic-escalation'],
                    deck: []
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.galacticEscalation);

            expect(context.player1).toHavePrompt('Playing Galactic Escalation will have no effect. Are you sure you want to play it?');
            expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);

            context.player1.clickPrompt('Play anyway');

            expect(context.galacticEscalation).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
