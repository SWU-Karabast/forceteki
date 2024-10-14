describe('Phase-iii Dark Trooper', function () {
    integration(function (contextRef) {
        describe('Phase-iii Dark Trooper\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['phaseiii-dark-trooper'],
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol'],
                    }
                });
            });

            it('should give experience token to Phase-iii Dark Trooper when it receives damage.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.phaseiiiDarkTrooper);
                context.player1.clickCard(context.r2d2);

                // check board state
                expect(context.phaseiiiDarkTrooper.damage).toBe(1);
                expect(context.phaseiiiDarkTrooper).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
