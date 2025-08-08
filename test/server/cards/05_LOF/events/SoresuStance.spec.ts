describe('Soresu Stance ability', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst'],
                    hand: ['soresu-stance', 'yoda#old-master', 'drain-essence', 'anakin-skywalker#ill-try-spinning'],
                }
            });
        });

        it('allows the player to play a Force unit from their hand and gives it a Shield token', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.soresuStance);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.anakinSkywalker]);
            context.player1.clickCard(context.yoda);

            expect(context.yoda).toHaveExactUpgradeNames(['shield']);
        });

        it('allows the player to play a Force pilot unit from their hand and gives it a Shield token', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.soresuStance);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.anakinSkywalker]);
            context.player1.clickCard(context.anakinSkywalker);

            expect(context.player2).toBeActivePlayer();

            expect(context.anakinSkywalker).toBeInZone('groundArena');
            expect(context.anakinSkywalker).toHaveExactUpgradeNames(['shield']);
        });
    });
});