describe('Gideon Hask, Ruthless Loyalist', function () {
    integration(function (contextRef) {
        describe('Gideon Hask\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine', 'blizzard-assault-atat'],
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['gideon-hask#ruthless-loyalist', 'specforce-soldier', 'atst'],
                    }
                });
            });

            it('should give an Experience to a friendly unit', function () {
                const { context } = contextRef;

                // Defeating an enemy unit by battle
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience']);

                // Friendly unit dies nothing happens
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.specforceSoldier);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();

                // Defeating an enemy unit using Vanquish
                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience', 'experience']);

                // Ability triggers even if Gideon Hask is defeated
                expect(context.player1).toBeActivePlayer();
                context.setDamage(context.blizzardAssaultAtat, 5);
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.gideonHask);
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Pass');
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
