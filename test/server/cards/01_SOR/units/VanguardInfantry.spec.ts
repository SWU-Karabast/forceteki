describe('Vanguard Infantry', function() {
    integration(function(contextRef) {
        describe('Vanguard Infantry\'s when defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'vanguard-infantry'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give an experience token to a unit when defeated in combat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token to a unit when defeated by an ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanguardInfantry);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
            });
        });
    });
});
