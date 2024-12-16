describe('Providence Destroyer', function() {
    integration(function(contextRef) {
        describe('Providence Destroyer\'s ability', function () {
            it('should give a enemy space unit -2/-2 for the phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['droideka-security'],
                        spaceArena: ['providence-destroyer', 'system-patrol-craft']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['consortium-starviper']
                    }
                });

                const { context } = contextRef;


                context.player1.clickCard(context.providenceDestroyer);
                context.player1.clickCard(context.p2Base);

                // give -2/-2 to an enemy sapce unit
                expect(context.player1).toBeAbleToSelectExactly([context.consortiumStarviper]);

                context.player1.clickCard(context.consortiumStarviper);
                expect(context.consortiumStarviper.getPower()).toBe(1);
                expect(context.consortiumStarviper.getHp()).toBe(1);

                context.moveToNextActionPhase();

                // revert -2/-2 at the end of phase
                expect(context.consortiumStarviper.getPower()).toBe(3);
                expect(context.consortiumStarviper.getHp()).toBe(3);
            });

            it('should not give -2/-2 without an enemy space unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['droideka-security'],
                        spaceArena: ['providence-destroyer', 'system-patrol-craft']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;


                context.player1.clickCard(context.providenceDestroyer);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});