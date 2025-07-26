describe('C-3PO Oh Dear Oh Dear', function() {
    integration(function(contextRef) {
        it('C-3PO Oh Dear Oh Dear\'s ability should draw a card when played if you control a Cunning unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['c3po#oh-dear-oh-dear'],
                    groundArena: ['crafty-smuggler']
                },
            });

            const { context } = contextRef;
            const deckSize = context.player1.deck.length;

            context.player1.clickCard(context.c3po);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck.length).toBe(deckSize - 1);
            expect(context.player1.hand.length).toBe(1);
        });

        it('C-3PO Oh Dear Oh Dear\'s ability should not draw a card when played if you do not control a Cunning unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['c3po#oh-dear-oh-dear'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['crafty-smuggler']
                }
            });

            const { context } = contextRef;
            const deckSize = context.player1.deck.length;

            context.player1.clickCard(context.c3po);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck.length).toBe(deckSize);
            expect(context.player1.hand.length).toBe(0); // -1 for playing C-3PO, +0 for not drawing a card
        });
    });
});