describe('Bolstered Endurance', function () {
    integration(function (contextRef) {
        it('Bolstered Endurance\'s ability should attach to a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bolstered-endurance'],
                    groundArena: ['wampa', 'yoda#old-master'],
                    spaceArena: ['leia-organa#extraordinary']
                },
                player2: {
                    groundArena: ['fifth-brother#fear-hunter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bolsteredEndurance);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.leiaOrgana, context.fifthBrother]);
            context.player1.clickCard(context.yoda);
        });
    });
});