describe('Paladin Training Corvette', function() {
    integration(function(contextRef) {
        it('Paladin Training Corvette\'s ability should give experience token to up to 3 force units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['paladin-training-corvette'],
                    groundArena: ['wampa', 'yoda#old-master', 'grogu#irresistible']
                },
                player2: {
                    groundArena: ['maul#shadow-collective-visionary', 'darth-maul#revenge-at-last']
                },
            });
            const { context } = contextRef;
            context.player1.clickCard(context.paladinTrainingCorvette);

            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.grogu, context.maul, context.darthMaul]);
            context.player1.clickCard(context.yoda);
            context.player1.clickCard(context.grogu);
            context.player1.clickCard(context.maul);
            context.player1.clickCardNonChecking(context.darthMaul);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();

            expect(context.yoda).toHaveExactUpgradeNames(['experience']);
            expect(context.grogu).toHaveExactUpgradeNames(['experience']);
            expect(context.maul).toHaveExactUpgradeNames(['experience']);
            expect(context.darthMaul.isUpgraded()).toBeFalse();
        });
    });
});
