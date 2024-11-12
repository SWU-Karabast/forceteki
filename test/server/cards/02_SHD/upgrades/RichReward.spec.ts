describe('Rich Reward', function() {
    integration(function(contextRef) {
        describe('Rich Reward\'s Bounty ability', function() {
            it('should give Experience token up to two units', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['rich-reward'] }, 'atst', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda, context.concordDawnInterceptors]);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toHavePrompt('Select 2 cards');

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.concordDawnInterceptors);
                context.player2.clickPrompt('Done');

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give Experience token only to two units even if more units are selected', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['rich-reward'] }, 'atst', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda, context.concordDawnInterceptors]);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toHavePrompt('Select 2 cards');

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.concordDawnInterceptors);
                context.player2.clickCardNonChecking(context.atst);
                context.player2.clickPrompt('Done');

                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
                expect(context.concordDawnInterceptors).toHaveExactUpgradeNames(['experience']);
                expect(context.atst.isUpgraded()).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should give Experience token to one unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['rich-reward'] }, 'atst', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda, context.concordDawnInterceptors]);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toHavePrompt('Select 2 cards');

                context.player2.clickCard(context.yoda);
                context.player2.clickPrompt('Done');

                expect(context.yoda).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
