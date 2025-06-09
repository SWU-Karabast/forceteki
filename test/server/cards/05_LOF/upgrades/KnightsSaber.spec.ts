describe('Knight\'s Saber', function () {
    integration(function (contextRef) {
        it('Knight\'s Saber\'s should only be attached to Jedi non-Vehicle unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['knights-saber'],
                    groundArena: ['guardian-of-the-whills', 'gungi#finding-himself'],
                    spaceArena: ['jedi-light-cruiser'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.knightsSaber);

            // cannot select guardian of the whills (he is not jedi)
            // cannot select jedi light cruiser (vehicle unit)
            expect(context.player1).toBeAbleToSelectExactly([context.gungi]);
            context.player1.clickCard(context.gungi);
        });
    });
});
