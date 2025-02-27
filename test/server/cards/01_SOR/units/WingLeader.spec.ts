describe('Wing Leader', function() {
    integration(function(contextRef) {
        describe('Wing Leader\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wing-leader'],
                        groundArena: ['21b-surgical-droid', 'fleet-lieutenant', { card: 'rebel-pathfinder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid']
                    }
                });
            });

            it('can give two experience to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.fleetLieutenant, context.rebelPathfinder]);
                context.player1.clickCard(context.fleetLieutenant);

                expect(context.fleetLieutenant).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('can give two experience to a unit that already has an experience', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wingLeader);
                expect(context.player1).toBeAbleToSelectExactly([context.fleetLieutenant, context.rebelPathfinder]);
                context.player1.clickCard(context.rebelPathfinder);

                expect(context.rebelPathfinder).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
        });
    });
});
