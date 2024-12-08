describe('Calculating MagnaGuard', function () {
    integration(function (contextRef) {
        describe('Calculating MagnaGuard\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['calculating-magnaguard'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'consular-security-force'],
                    }
                });
            });

            it('should gain sentinel when played or when a friendly unit is defeated', function () {
                const { context } = contextRef;

                // play calculating magna guard, he should have sentinel
                context.player1.clickCard(context.calculatingMagnaguard);

                // opponent attack with battlefield marine, it should choose automatically calculating magna guard
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeActivePlayer();
                expect(context.calculatingMagnaguard.damage).toBe(3);

                context.setDamage(context.calculatingMagnaguard, 0);
                context.moveToNextActionPhase();

                // wampa attack atst and die, calculating magna guard should have sentinel
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                // opponent attack with consular security force, it should choose automatically calculating magna guard
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player1).toBeActivePlayer();
                expect(context.calculatingMagnaguard.damage).toBe(3);
            });
        });
    });
});
