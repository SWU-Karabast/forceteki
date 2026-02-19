describe('Incapacitate', function() {
    integration(function(contextRef) {
        it('should give a unit -2/-2 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['incapacitate'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            const initialPower = context.wampa.getPower();
            const initialHp = context.wampa.getHp();

            context.player1.clickCard(context.incapacitate);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(initialPower - 2);
            expect(context.wampa.getHp()).toBe(initialHp - 2);

            context.moveToNextActionPhase();

            expect(context.wampa.getPower()).toBe(initialPower);
            expect(context.wampa.getHp()).toBe(initialHp);
        });
    });
});
