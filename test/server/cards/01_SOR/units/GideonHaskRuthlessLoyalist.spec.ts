describe('Gideon Hask, Ruthless Loyalist', function () {
    integration(function (contextRef) {
        describe('Gideon Hask\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine', 'blizzard-assault-atat'],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['r2d2#artooooooooo'] }],
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['gideon-hask#ruthless-loyalist', 'specforce-soldier', 'atst'],
                    },
                });
            });

            it('should give an Experience to a friendly unit when an enemy unit is defeated', function () {
                const { context } = contextRef;

                // Defeating an enemy unit by battle
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience']);

                // Defeating an enemy unit using Vanquish
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);
                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('should do nothing when a friendly unit is defeated', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.specforceSoldier);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
            });

            it('should trigger even if Gideon Hask is defeated', function () {
                const { context } = contextRef;

                context.setDamage(context.blizzardAssaultAtat, 5);
                context.player1.clickCard(context.blizzardAssaultAtat);
                context.player1.clickCard(context.gideonHask);
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Pass');

                context.player2.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['experience']);
            });

            it('should trigger once if an enemy unit with a pilot is defeated', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.cartelSpacer);

                expect(context.player2).toBeAbleToSelectExactly([context.specforceSoldier, context.gideonHask, context.atst]);

                context.player2.clickCard(context.gideonHask);

                expect(context.gideonHask).toHaveExactUpgradeNames(['experience']);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
