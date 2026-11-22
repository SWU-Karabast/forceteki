describe('Easy Prey', function() {
    integration(function(contextRef) {
        it('Easy Prey\'s ability should create a Beast token for both players and give a Weakness token to the opponent\'s Beast', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['easy-prey'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.easyPrey);

            expect(context.player2).toBeActivePlayer();
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);
            expect(p1Beast).toHaveExactUpgradeNames([]);

            const p2Beast = context.player2.findCardByName('beast');
            expect(p2Beast).toBeInZone('groundArena', context.player2);
            expect(p2Beast).toHaveExactUpgradeNames(['weakness']);
        });
    });
});