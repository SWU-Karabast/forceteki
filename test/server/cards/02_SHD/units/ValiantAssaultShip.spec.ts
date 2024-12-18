describe('Valiant Assault Ship', function () {
    integration(function (contextRef) {
        describe('Valiant Assault Ship\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['valiant-assault-ship']
                    },
                    player2: {
                        spaceArena: [{ card: 'system-patrol-craft', upgrades: ['shield'] }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give a unit +2/+0 for this attack when the opponent has more resources', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(5);
                context.player2.setResourceCount(6);

                context.player1.clickCard(context.valiantAssaultShip);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveEnabledPromptButton('If the defending player controls more resources than you, this unit gets +2/+0 for this attack');
                expect(context.player1).toHaveEnabledPromptButton('Saboteur: defeat all shields');
                expect(context.valiantAssaultShip.exhausted).toBe(true);

                context.player1.clickPrompt('If the defending player controls more resources than you, this unit gets +2/+0 for this attack');
                expect(context.systemPatrolCraft.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not give a unit +2/+0 for this attack', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(5);
                context.player2.setResourceCount(5);

                context.player1.clickCard(context.valiantAssaultShip);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.player1).toHaveEnabledPromptButton('Saboteur: defeat all shields');

                context.player1.clickPrompt('Saboteur: defeat all shields');
                expect(context.systemPatrolCraft.damage).toBe(3);
                expect(context.systemPatrolCraft.upgrades.length).toBe(0);
            });
        });
    });
});
