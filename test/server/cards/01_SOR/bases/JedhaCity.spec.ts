describe('Jedha City', function() {
    integration(function(contextRef) {
        describe('Jedha City\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'jedha-city',
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent']
                    }
                });
            });

            it('should apply -4/0 to a unit for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jedhaCity);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.pykeSentinel]);

                context.player1.clickCard(context.atst);
                expect(context.atst.getPower()).toBe(2);

                // move to next phase and confirm effect is ended
                context.moveToRegroupPhase();
                expect(context.atst.getPower()).toBe(6);
            });
        });
    });
});
