describe('Valiant Assault Ship', function () {
    integration(function (contextRef) {
        describe('Valiant Assault Ship\'s ability', function () {
            it('should give a unit +2/+0 for this attack', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['valiant-assault-ship'],
                        resources: 5
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.valiantAssaultShip);
                expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.systemPatrolCraft.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
            });
        });
    });
});
