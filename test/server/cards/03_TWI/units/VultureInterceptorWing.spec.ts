describe('Vulture Interceptor Wing', function () {
    integration(function (contextRef) {
        describe('Vulture Interceptor Wing\'s ability', function () {
            it('should give -1/-1 to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['vulture-interceptor-wing'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vultureInterceptorWing);
                context.player1.clickCard(context.p2Base);

                // give -1/-1 to an enemy unit
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(2);
                expect(context.battlefieldMarine.getHp()).toBe(2);

                context.moveToNextActionPhase();

                // revert -1/-1 at the end of phase
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });
    });
});
