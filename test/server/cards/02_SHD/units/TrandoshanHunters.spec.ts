describe('Trandoshan Hunters', function () {
    integration(function (contextRef) {
        describe('Trandoshan Hunters\'s ability', function () {
            it('should give an experience token to this unit because opponent has a unit with bounty.', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['trandoshan-hunters'],
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer']
                    }
                });

                context.player1.clickCard(context.trandoshanHunters);
                expect(context.trandoshanHunters).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give an experience token to this unit because opponent does not have a unit with bounty', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['trandoshan-hunters'],
                    },
                });

                context.player1.clickCard(context.trandoshanHunters);
                expect(context.trandoshanHunters.isUpgraded()).toBeFalse();
            });
        });
    });
});
