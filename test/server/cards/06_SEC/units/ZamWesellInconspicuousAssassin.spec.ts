describe('Zam Wesell, Inconspicuous Assassin', function () {
    integration(function (contextRef) {
        it('Zam Wesell ability should not give Grit when she is not upgraded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'zam-wesell#inconspicuous-assassin', damage: 3 }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zamWesell);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);
        });

        it('Zam Wesell ability should give Grit when she is upgraded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'zam-wesell#inconspicuous-assassin', upgrades: ['shield'], damage: 3 }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zamWesell);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
        });
    });
});
