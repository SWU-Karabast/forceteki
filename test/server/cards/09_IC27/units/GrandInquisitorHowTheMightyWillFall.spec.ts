describe('Grand Inquisitor, How the Mighty Will Fall', function () {
    integration(function (contextRef) {
        it('should not have Raid or Saboteur while undamaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['grand-inquisitor#how-the-mighty-will-fall']
                },
                player2: {
                    groundArena: ['niima-outpost-constables', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandInquisitor);
            expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
            context.player1.clickCard(context.niimaOutpostConstables);

            expect(context.niimaOutpostConstables.damage).toBe(3);
            expect(context.grandInquisitor.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should gain Saboteur and Raid 3 while damaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'grand-inquisitor#how-the-mighty-will-fall', damage: 1 }]
                },
                player2: {
                    groundArena: ['echo-base-defender', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandInquisitor);

            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.wampa, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(6);
        });
    });
});
