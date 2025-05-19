describe('Drengir Spawn', function() {
    integration(function(contextRef) {
        describe('Drengir Spawn\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['drengir-spawn'],
                    },
                    player2: {
                        groundArena: ['alliance-dispatcher', 'battlefield-marine', 'wilderness-fighter', 'batch-brothers']
                    }
                });
            });

            it('should gain 1 Experience token when defeating Alliance Dispatcher (cost 1)', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.drengirSpawn);
                player1.clickCard(context.allianceDispatcher);

                expect(player2).toBeActivePlayer();
                expect(context.drengirSpawn).toHaveExactUpgradeNames(['experience']);
            });

            it('should gain 3 Experience tokens when defeating Batch Brothers (cost 3)', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.drengirSpawn);
                player1.clickCard(context.batchBrothers);

                expect(player2).toBeActivePlayer();
                expect(context.drengirSpawn).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });

            it('should not gain Experience tokens when targeting a base (not a unit)', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.drengirSpawn);
                player1.clickCard(context.p2Base);

                expect(player2).toBeActivePlayer();
                expect(context.drengirSpawn.isUpgraded()).toBeFalse();
            });

            it('should not gain Experience tokens when unable to defeat Wilderness Fighter', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.drengirSpawn);
                player1.clickCard(context.wildernessFighter);

                expect(player2).toBeActivePlayer();
                expect(context.drengirSpawn.isUpgraded()).toBeFalse();
            });

            it('should be defeated when attacking Battlefield Marine', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.drengirSpawn);
                player1.clickCard(context.battlefieldMarine);

                expect(player2).toBeActivePlayer();
                expect(context.drengirSpawn).toBeInZone('discard', player1);
            });
        });
    });
});
