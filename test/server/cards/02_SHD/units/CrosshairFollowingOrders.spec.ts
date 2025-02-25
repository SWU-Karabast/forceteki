describe('Crosshair', function() {
    integration(function(contextRef) {
        describe('Crosshair\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['crosshair#following-orders', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should boost him or deal damage to a enemy ground unit', function () {
                const { context } = contextRef;
                // boost crosshair
                context.player1.clickCard(context.crosshair);
                expect(context.player1).toHaveExactPromptButtons(['Attack', 'Get +1/+0 for this phase', 'Deal damage equal to his power to an enemy ground unit', 'Cancel']);
                context.player1.clickPrompt('Get +1/+0 for this phase');
                expect(context.player2).toBeActivePlayer();
                expect(context.crosshair.exhausted).toBeFalse();
                expect(context.crosshair.getPower()).toBe(3); // 2+1 = 3
                expect(context.crosshair.getHp()).toBe(6);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // boost crosshair again
                context.player2.passAction();
                context.player1.clickCard(context.crosshair);
                expect(context.player1).toHaveExactPromptButtons(['Attack', 'Get +1/+0 for this phase', 'Deal damage equal to his power to an enemy ground unit', 'Cancel']);
                context.player1.clickPrompt('Get +1/+0 for this phase');
                expect(context.player2).toBeActivePlayer();
                expect(context.crosshair.exhausted).toBeFalse();
                expect(context.crosshair.getPower()).toBe(4);// 2+1+1 = 4
                expect(context.crosshair.getHp()).toBe(6);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                // deal damage equal to his current power (4)
                context.player2.passAction();
                context.player1.clickCard(context.crosshair);
                expect(context.player1).toHaveExactPromptButtons(['Attack', 'Get +1/+0 for this phase', 'Deal damage equal to his power to an enemy ground unit', 'Cancel']);
                context.player1.clickPrompt('Deal damage equal to his power to an enemy ground unit');
                expect(context.player2).toBeActivePlayer();
                expect(context.crosshair.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(4);

                // attack base for 4
                context.crosshair.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.crosshair);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                // after the end of phase, boost are reverted back
                context.moveToRegroupPhase();
                expect(context.crosshair.getPower()).toBe(2);
                expect(context.crosshair.getHp()).toBe(6);
            });
        });
    });
});
