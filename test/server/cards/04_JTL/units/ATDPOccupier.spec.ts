describe('AT-DP Occupier', function() {
    integration(function(contextRef) {
        it('AT-DP Occupier\'s ability should decrease cost by 1 for each damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atdp-occupier'],
                    groundArena: [{ card: 'wampa', damage: 1 }, 'battlefield-marine'],
                    leader: 'sabine-wren#galvanized-revolutionary'
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: [{ card: 'atst', damage: 2 }],
                    spaceArena: [{ card: 'republic-arc170', damage: 1 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.atdpOccupier);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
