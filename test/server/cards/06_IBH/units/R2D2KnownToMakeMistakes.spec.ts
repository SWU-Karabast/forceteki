describe('R2-D2, Known To Make Mistakes', function () {
    integration(function (contextRef) {
        it('R2-D2\'s ability should exhaust an enemy ground unit that costs 4 or less when played if you control a Command unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r2d2#known-to-make-mistakes'],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    groundArena: ['atst', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            // Verify the enemy unit is exhausted
            expect(context.wampa.exhausted).toBe(true);
        });

        it('R2-D2\'s ability should not trigger the ability if you do not control a Command unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r2d2#known-to-make-mistakes', 'wampa'] // Not a Command unit
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.r2d2);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
        });
    });
});