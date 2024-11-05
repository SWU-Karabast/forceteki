describe('Gideon Hask, Ruthless Loyalist', function () {
    integration(function (contextRef) {
        describe('Gideon Hask\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['gideon-hask#ruthless-loyalist', 'specforce-soldier', 'atst'],
                    }
                });
            });

            it('should give an Experience to a friendly unit', function () {
                const { context } = contextRef;

                // Defeating an enemy unit
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an Experience to a friendly unit when enemy unit is defeated by event', function () {
                const { context } = contextRef;

                // Defeating an enemy unit using Vanquish
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
