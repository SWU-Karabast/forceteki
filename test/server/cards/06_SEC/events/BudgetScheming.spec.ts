describe('Budget Scheming', function () {
    integration(function (contextRef) {
        describe('Budget Scheming\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['budget-scheming'],
                        groundArena: ['regional-governor', 'colonel-yularen#isb-director', 'admiral-ozzel#overconfident'],
                        spaceArena: ['strikeship']
                    },
                    player2: {
                        groundArena: ['leia-organa#defiant-princess'],
                    }
                });
            });

            it('should give experience token to up to 3 Official units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.budgetScheming);

                // should be able to select all Official
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.colonelYularenIsbDirector, context.admiralOzzelOverconfident, context.leiaOrganaDefiantPrincess]);
                context.player1.clickCard(context.regionalGovernor);
                context.player1.clickCard(context.colonelYularenIsbDirector);
                context.player1.clickCard(context.admiralOzzelOverconfident);

                context.player1.clickDone();

                // check experience token
                expect(context.leiaOrganaDefiantPrincess.isUpgraded()).toBeFalse();
                expect(context.strikeship.isUpgraded()).toBeFalse();
                expect(context.regionalGovernor).toHaveExactUpgradeNames(['experience']);
                expect(context.colonelYularenIsbDirector).toHaveExactUpgradeNames(['experience']);
                expect(context.admiralOzzelOverconfident).toHaveExactUpgradeNames(['experience']);
            });

            it('should give experience token to up to 3 Official units (choose 2, 1 enemy)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.budgetScheming);

                // should be able to select all Official
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.colonelYularenIsbDirector, context.admiralOzzelOverconfident, context.leiaOrganaDefiantPrincess]);
                context.player1.clickCard(context.regionalGovernor);
                context.player1.clickCard(context.leiaOrganaDefiantPrincess);

                context.player1.clickDone();

                // check experience token
                expect(context.colonelYularenIsbDirector.isUpgraded()).toBeFalse();
                expect(context.strikeship.isUpgraded()).toBeFalse();
                expect(context.admiralOzzelOverconfident.isUpgraded()).toBeFalse();
                expect(context.regionalGovernor).toHaveExactUpgradeNames(['experience']);
                expect(context.leiaOrganaDefiantPrincess).toHaveExactUpgradeNames(['experience']);
            });

            it('should allow you to choose nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.budgetScheming);

                // should be able to select all Official
                expect(context.player1).toBeAbleToSelectExactly([context.regionalGovernor, context.colonelYularenIsbDirector, context.admiralOzzelOverconfident, context.leiaOrganaDefiantPrincess]);
                context.player1.clickPrompt('Choose Nothing');

                // check experience token
                expect(context.leiaOrganaDefiantPrincess.isUpgraded()).toBeFalse();
                expect(context.strikeship.isUpgraded()).toBeFalse();
                expect(context.regionalGovernor.isUpgraded()).toBeFalse();
                expect(context.colonelYularenIsbDirector.isUpgraded()).toBeFalse();
                expect(context.admiralOzzelOverconfident.isUpgraded()).toBeFalse();
            });
        });
    });
});