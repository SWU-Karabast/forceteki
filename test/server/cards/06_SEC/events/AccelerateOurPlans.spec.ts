describe('Accelerate Our Plans', function () {
    integration(function (contextRef) {
        it('Accelerate Our Plans\'s ability should exhaust a friendly unit, then attack with another unit. It gets +3/+0 for this attack.', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['accelerate-our-plans'],
                    groundArena: ['battlefield-marine', 'wampa']
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.accelerateOurPlans);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(7);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
