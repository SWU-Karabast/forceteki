describe('Muckraker Crab Droid', function() {
    integration(function(contextRef) {
        it('Muckraker Crab Droid\'s can not be attacked while he is ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['muckraker-crab-droid']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Muckraker Crab Droid\'s can be attacked while he is exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'muckraker-crab-droid', exhausted: true }]
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.muckrakerCrabDroid]);
            context.player2.clickCard(context.p1Base);
        });
    });
});