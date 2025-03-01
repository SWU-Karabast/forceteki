describe('Stolen AT-Hauler\'s ability', function() {
    integration(function(contextRef) {
        it('should allow the opponent to play it from its owner discard pile for free when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['stolen-athauler']
                },
                player2: {
                    hand: ['vanquish'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('discard');

            context.player1.passAction();
            expect(context.player2).toBeActivePlayer();

            const readyResourceCount = context.player2.readyResourceCount;
            context.player2.clickCard(context.stolenAthauler);

            expect(context.stolenAthauler).toBeInZone('spaceArena');
            expect(context.player2.readyResourceCount).toBe(readyResourceCount); // No resources spent
        });
    });
});
