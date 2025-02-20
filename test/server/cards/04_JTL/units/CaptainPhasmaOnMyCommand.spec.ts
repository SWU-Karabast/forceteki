describe('Captain Phasma', function () {
    integration(function (contextRef) {
        it('Captain Phasma\'s ability should give another First Order unit +2/+2 on play and attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['captain-phasma#on-my-command'],
                    groundArena: ['kylo-ren#killing-the-past'],
                    spaceArena: ['kylos-tie-silencer#ruthlessly-efficient']
                },
                player2: {
                    groundArena: ['admiral-motti#brazen-and-scornful'],
                    spaceArena: ['first-order-tie-fighter']
                }
            });

            const { context } = contextRef;

            // Play Phasma, and give Silencer +2/+2
            context.player1.clickCard(context.captainPhasma);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.kyloRen, context.kylosTieSilencer, context.firstOrderTieFighter]);
            context.player1.clickCard(context.kylosTieSilencer);
            expect(context.kylosTieSilencer.getPower()).toBe(5);
            expect(context.kylosTieSilencer.getHp()).toBe(4);

            // Check stat modifier has dropped
            context.moveToNextActionPhase();
            expect(context.kylosTieSilencer.getPower()).toBe(3);
            expect(context.kylosTieSilencer.getHp()).toBe(2);

            // Attack with Phasma, give Enemy First Order unit +2/+2
            context.player1.clickCard(context.captainPhasma);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.firstOrderTieFighter);
            expect(context.firstOrderTieFighter.getPower()).toBe(4);
            expect(context.firstOrderTieFighter.getHp()).toBe(3);

            // Check stat modifier has dropped
            context.moveToNextActionPhase();
            expect(context.firstOrderTieFighter.getPower()).toBe(2);
            expect(context.firstOrderTieFighter.getHp()).toBe(1);
        });
    });
});
