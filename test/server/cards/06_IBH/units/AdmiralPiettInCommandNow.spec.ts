describe('Admiral Piett In Command Now', function() {
    integration(function(contextRef) {
        it('Admiral Piett In Command Now\'s ability should draw a card when attacking if you control an Aggression unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'admiral-piett#in-command-now']
                },
            });

            const { context } = contextRef;
            const deckSize = context.player1.deck.length;

            context.player1.clickCard(context.admiralPiett);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck.length).toBe(deckSize - 1);
            expect(context.player1.hand.length).toBe(1);
        });

        it('Admiral Piett In Command Now\'s ability should not draw a card when attacking if you do not control an Aggression unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst', 'admiral-piett#in-command-now']
                },
            });

            const { context } = contextRef;
            const deckSize = context.player1.deck.length;

            context.player1.clickCard(context.admiralPiett);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck.length).toBe(deckSize);
            expect(context.player1.hand.length).toBe(0);
        });
    });
});