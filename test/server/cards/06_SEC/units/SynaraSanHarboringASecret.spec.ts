describe('Synara San, Harboring a Secret', function () {
    integration(function (contextRef) {
        it('should ready resources equal to the number of friendly units when she attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['synara-san#harboring-a-secret', 'battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            // Exhaust 5 of 6 resources: ready=1, exhausted=5
            context.player1.exhaustResources(5);
            expect(context.player1.readyResourceCount).toBe(1);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            // Attack with Synara -> ready a resource for each friendly unit (Synara + 2 others = 3)
            context.player1.clickCard(context.synaraSanHarboringASecret);
            context.player1.clickCard(context.p2Base);

            // After readying 3: ready=4, exhausted=2
            expect(context.player1.readyResourceCount).toBe(4);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
