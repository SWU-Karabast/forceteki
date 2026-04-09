describe('Wartime Refugee', function () {
    integration(function (contextRef) {
        it('Wartime Refugee\'s ability should heal 1 damage on opponent\'s base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wartime-refugee'],
                    base: { card: 'echo-base', damage: 3 }
                },
                player2: {
                    base: { card: 'jabbas-palace', damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wartimeRefugee);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3);
            // Should be 5 but heals 1
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
