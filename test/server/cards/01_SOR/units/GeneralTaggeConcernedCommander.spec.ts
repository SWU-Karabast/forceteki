describe('General Tagge, Concerned Commander', function () {
    integration(function (contextRef) {
        describe('General Tagge\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['general-tagge#concerned-commander'],
                        groundArena: ['vanguard-infantry', 'mercenary-company', 'battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: ['volunteer-soldier'],
                    }
                });
            });

            it('should give experience token to up to 3 Trooper unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalTagge);

                // should be able to select all trooper
                expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.mercenaryCompany, context.battlefieldMarine, context.volunteerSoldier]);
                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickCard(context.mercenaryCompany);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.clickPrompt('Done');

                // check experience token
                expect(context.volunteerSoldier.isUpgraded()).toBeFalse();
                expect(context.vanguardInfantry).toHaveExactUpgradeNames(['experience']);
                expect(context.mercenaryCompany).toHaveExactUpgradeNames(['experience']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should give experience token to up to 3 Trooper unit (choose 2)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalTagge);

                // should be able to select all trooper
                expect(context.player1).toBeAbleToSelectExactly([context.vanguardInfantry, context.mercenaryCompany, context.battlefieldMarine, context.volunteerSoldier]);
                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickCard(context.mercenaryCompany);

                context.player1.clickPrompt('Done');

                // check experience token
                expect(context.volunteerSoldier.isUpgraded()).toBeFalse();
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.vanguardInfantry).toHaveExactUpgradeNames(['experience']);
                expect(context.mercenaryCompany).toHaveExactUpgradeNames(['experience']);
            });
        });

        describe('General Tagge\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['general-tagge#concerned-commander'],
                        groundArena: ['wampa']
                    },
                    player2: {}
                });
            });

            it('should not give any experience token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalTagge);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});

