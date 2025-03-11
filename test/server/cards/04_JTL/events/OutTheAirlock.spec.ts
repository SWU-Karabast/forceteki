describe('Out the air lock', function() {
    integration(function(contextRef) {
        it('Out the air lock\'s ability should apply -5/-5 to a unit for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['out-the-airlock'],
                    groundArena: ['fifth-brother#fear-hunter']
                },
                player2: {
                    groundArena: ['reinforcement-walker'],
                    spaceArena: ['devastator#inescapable']
                }
            });

            const { context } = contextRef;

            // Apply the effect to a unit
            context.player1.clickCard(context.outTheAirlock);
            expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.reinforcementWalker, context.devastator]);
            context.player1.clickCard(context.devastator);
            expect(context.devastator.getPower()).toBe(5);
            expect(context.devastator.getHp()).toBe(5);

            context.moveToNextActionPhase();
            expect(context.devastator.getPower()).toBe(10);
            expect(context.devastator.getHp()).toBe(10);
        });
    });
});
