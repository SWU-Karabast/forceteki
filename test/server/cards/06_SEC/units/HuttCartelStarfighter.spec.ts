describe('Hutt Cartel Starfighter', function() {
    integration(function(contextRef) {
        it('Hutt Cartel Starfighter\'s ability deals 2 damage to the unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hutt-cartel-starfighter'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huttCartelStarfighter);

            expect(context.player2).toBeActivePlayer();
            expect(context.huttCartelStarfighter.damage).toBe(2);
            expect(context.wampa.damage).toBe(0);
            expect(context.atst.damage).toBe(0);
        });
    });
});
