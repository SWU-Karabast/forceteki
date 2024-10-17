describe('Disarm', function() {
    integration(function(contextRef) {
        describe('Disarm\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: [
                            { card: 'tieln-fighter', upgrades: ['academy-training'] },
                            { card: 'cartel-spacer', upgrades: ['entrenched'] }
                        ]
                    }
                });
            });

            it('should apply -4/0 to an enemy unit for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.disarm);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.tielnFighter, context.cartelSpacer]);

                context.player1.clickCard(context.atst);
                expect(context.atst.getPower()).toBe(2);

                // move to next phase and confirm effect is ended
                context.moveToNextActionPhase();
                expect(context.atst.getPower()).toBe(6);
            });
        });
    });
});
