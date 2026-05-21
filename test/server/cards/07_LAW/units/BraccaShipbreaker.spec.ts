describe('Bracca Shipbreaker', function() {
    integration(function(contextRef) {
        it('should discard a card from deck when attacking', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bracca-shipbreaker'],
                    deck: ['wampa', 'battlefield-marine', 'rebel-pathfinder']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.braccaShipbreaker);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck.length).toBe(2);
            expect(context.player1.discard.length).toBe(1);
            expect(context.wampa).toBeInZone('discard', context.player1);
        });

        it('should work correctly when deck has minimal cards', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bracca-shipbreaker'],
                    deck: []
                },
                player2: {
                    deck: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            // Attack with Bracca Shipbreaker
            context.player1.clickCard(context.braccaShipbreaker);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.discard.length).toBe(0);
            expect(context.p1Base.damage).toBe(0);
        });
    });
});
