describe('Reputable Hunter', function() {
    integration(function(contextRef) {
        describe('Reputable Hunter\'s decrease cost ability', function() {
            it('should cost 3 if there are no bounties on enemy units', () => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reputable-hunter'],
                        groundArena: ['hylobon-enforcer'],
                        base: 'energy-conversion-lab',
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.reputableHunter);

                expect(context.player1.countExhaustedResources()).toBe(3);
            });


            it('should cost 2 after we play a bounty on a unit', () => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reputable-hunter', 'top-target'],
                        base: 'energy-conversion-lab',
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.topTarget);
                const exhaustedResourcesBeforePlay = context.player1.countExhaustedResources();
                context.player2.passAction();
                context.player1.clickCard(context.reputableHunter);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['top-target']);
                expect(context.player1.countExhaustedResources() - exhaustedResourcesBeforePlay).toBe(2);
            });

            it('should cost 2 if opponent has a unit with a dedicated bounty in play', () => {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['reputable-hunter'],
                        base: 'energy-conversion-lab',
                    },
                    player2: {
                        hand: ['hylobon-enforcer'],
                    }
                });
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.reputableHunter);

                expect(context.player1.countExhaustedResources()).toBe(2);
            });
        });
    });
});
