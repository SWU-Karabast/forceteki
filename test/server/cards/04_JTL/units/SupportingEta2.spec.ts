describe('Supporting Eta-2', function () {
    integration(function (contextRef) {
        it('Supporting Eta-2\'s ability should give a ground unit +2/+0 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['supporting-eta2'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.supportingEta2);
            context.player1.clickCard(context.p2Base);

            // give +2/+0 to a ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(5);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(8);// 2+6

            context.moveToNextActionPhase();

            // next phase, lasting effect should have expired
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
