describe('Arms Deal', function() {
    integration(function(contextRef) {
        it('should have each player draw 2 cards', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arms-deal'],
                    deck: ['wampa', 'atst', 'repair']
                },
                player2: {
                    deck: ['battlefield-marine', 'confiscate', 'disarm']
                }
            });

            const { context } = contextRef;

            expect(context.player1.deck.length).toBe(3);
            expect(context.player2.deck.length).toBe(3);

            context.player1.clickCard(context.armsDeal);

            expect(context.player2).toBeActivePlayer();
            expect(context.armsDeal).toBeInZone('discard', context.player1);

            expect(context.player1.deck.length).toBe(1);
            expect(context.player2.deck.length).toBe(1);

            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);

            expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
            expect(context.confiscate).toBeInZone('hand', context.player2);
        });

        it('should resolve even if both players have empty decks', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arms-deal'],
                    deck: []
                },
                player2: {
                    deck: []
                }
            });

            const { context } = contextRef;

            expect(context.player1.deck.length).toBe(0);
            expect(context.player2.deck.length).toBe(0);

            context.player1.clickCard(context.armsDeal);

            expect(context.player2).toBeActivePlayer();
            expect(context.armsDeal).toBeInZone('discard', context.player1);
            expect(context.player1.hand.length).toBe(0);
            expect(context.player2.hand.length).toBe(0);
            expect(context.p1Base.damage).toBe(6);
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
