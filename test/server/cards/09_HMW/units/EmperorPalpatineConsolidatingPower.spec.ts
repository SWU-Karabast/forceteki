describe('Emperor Palpatine Consolidating Power', function() {
    integration(function(contextRef) {
        it('Emperor Palpatine Consolidating Power\'s ability should take control of an enemy non-leader unit that costs 3 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emperor-palpatine#consolidating-power']
                },
                player2: {
                    groundArena: ['gungi#finding-himself', 'wampa', { card: 'yoda#old-master', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.gungi]);
            context.player1.clickCard(context.gungi);

            expect(context.player2).toBeActivePlayer();
            expect(context.gungi).toBeInZone('groundArena', context.player1);
            expect(context.gungi).toHaveExactUpgradeNames(['weakness', 'weakness']);
        });
    });
});