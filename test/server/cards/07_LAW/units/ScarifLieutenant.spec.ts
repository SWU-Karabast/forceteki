describe('Scarif Lieutenant', function() {
    integration(function(contextRef) {
        describe('Scarif Lieutenant\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'scarif-lieutenant'],
                        spaceArena: ['lurking-tie-phantom']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['pyke-sentinel', 'fleet-lieutenant'],
                    }
                });
            });

            it('should give a friendly Rebel unit an Experience token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.scarifLieutenant);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.player1).toBeAbleToSelectExactly(context.battlefieldMarine);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
            });

            it('should work with NGOR', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.scarifLieutenant);

                expect(context.player2).toBeAbleToSelectExactly(context.fleetLieutenant);
                context.player2.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});