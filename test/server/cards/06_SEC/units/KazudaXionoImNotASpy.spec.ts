describe('Kazuda Xiono, I\'m Not a Spy', function () {
    integration(function (contextRef) {
        it('Kazuda Xiono should not have +2/+0 while he has equal or more resource than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['kazuda-xiono#im-not-a-spy'],
                    resources: 9
                },
                player2: {
                    resources: 9
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);

            expect(context.kazudaXiono.getPower()).toBe(2);
            expect(context.kazudaXiono.getHp()).toBe(6);
        });

        it('Kazuda Xiono should have +2/+0 while he has fewer than opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['kazuda-xiono#im-not-a-spy'],
                    resources: 8
                },
                player2: {
                    resources: 9
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(6);

            expect(context.kazudaXiono.getPower()).toBe(4);
            expect(context.kazudaXiono.getHp()).toBe(6);
        });
    });
});
