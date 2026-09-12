describe('Dragon\'s Might', function() {
    integration(function(contextRef) {
        it('Dragon\'s Might\'s ability should defeat a non-leader unit with 4 or less power', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dragons-might']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dragonsMight);

            // Only the 3-power Battlefield Marine is a legal target; AT-ST (6 power) is excluded
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});
