describe('Zealous Soldier', function() {
    integration(function(contextRef) {
        it('Zealous Soldier\'s ability should give him and advantage token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['zealous-soldier'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['wampa', 'battlefield-marine', 'pyke-sentinel'],
                    groundArena: ['scout-bike-pursuer']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.zealousSoldier);
            expect(context.player2).toBeActivePlayer();
            expect(context.zealousSoldier).toHaveExactUpgradeNames(['advantage']);
        });
    });
});
