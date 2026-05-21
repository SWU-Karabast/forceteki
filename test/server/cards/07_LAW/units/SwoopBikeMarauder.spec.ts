describe('Swoop Bike Marauder', function() {
    integration(function(contextRef) {
        it('should draw a card when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['swoop-bike-marauder'],
                    deck: ['wampa', 'battlefield-marine', 'rebel-pathfinder']
                },
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.hand.length;

            context.player1.clickCard(context.swoopBikeMarauder);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hand.length).toBe(initialHandSize + 1);
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.player1.deck.length).toBe(2);
        });

        it('should deal 3 damage to itself if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['swoop-bike-marauder'],
                    deck: []
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.swoopBikeMarauder);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(3);
        });
    });
});
