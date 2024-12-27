describe('Supercommando Squad', function() {
    integration(function(contextRef) {
        describe('Supercommando Squad\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'supercommando-squad', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedha-agitator'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give it sentinel only as long as it is upgraded', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                // Supercommando Squad automatically selected due to sentinel

                expect(context.player1).toBeActivePlayer();
                // no damage because of shield
                expect(context.supercommandoSquad.damage).toBe(0);
                expect(context.supercommandoSquad.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(4);

                context.player1.passAction();

                context.player2.clickCard(context.jedhaAgitator);

                // player 2 should be able to select base and unit because supercommando squad is not sentinel anymore
                expect(context.player2).toBeAbleToSelectExactly([context.supercommandoSquad, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
