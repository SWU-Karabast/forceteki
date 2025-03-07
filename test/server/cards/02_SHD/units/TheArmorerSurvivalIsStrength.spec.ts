describe('The Armorer, Survival Is Strength', function () {
    integration(function (contextRef) {
        describe('The Armorer\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-armorer#survival-is-strength'],
                        groundArena: ['house-kast-soldier', 'mandalorian-warrior', 'wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['supercommando-squad'],
                    }
                });
            });

            it('should give shield token to up to 3 Mandalorian unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theArmorer);

                // should be able to select all mandalorian
                expect(context.player1).toBeAbleToSelectExactly([context.houseKastSoldier, context.mandalorianWarrior, context.concordDawnInterceptors, context.theArmorer, context.supercommandoSquad]);
                context.player1.clickCard(context.houseKastSoldier);
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCardNonChecking(context.theArmorer);

                context.player1.clickPrompt('Done');

                // check shield token
                expect(context.supercommandoSquad.isUpgraded()).toBeFalse();
                expect(context.theArmorer.isUpgraded()).toBeFalse();
                expect(context.houseKastSoldier).toHaveExactUpgradeNames(['shield']);
                expect(context.mandalorianWarrior).toHaveExactUpgradeNames(['shield']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['shield']);
            });

            it('should give experience token to up to 3 Mandalorian unit (choose 2)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theArmorer);

                // should be able to select all mandalorian
                expect(context.player1).toBeAbleToSelectExactly([context.houseKastSoldier, context.mandalorianWarrior, context.concordDawnInterceptors, context.theArmorer, context.supercommandoSquad]);
                context.player1.clickCard(context.houseKastSoldier);
                context.player1.clickCard(context.mandalorianWarrior);

                context.player1.clickPrompt('Done');

                // check shield token
                expect(context.supercommandoSquad.isUpgraded()).toBeFalse();
                expect(context.theArmorer.isUpgraded()).toBeFalse();
                expect(context.concordDawnInterceptors.isUpgraded()).toBeFalse();
                expect(context.houseKastSoldier).toHaveExactUpgradeNames(['shield']);
                expect(context.mandalorianWarrior).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});

