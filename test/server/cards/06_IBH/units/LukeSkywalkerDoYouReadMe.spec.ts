describe('Luke Skywalker Do You Read Me', function() {
    integration(function(contextRef) {
        it('Luke Skywalker Do You Read Me\'s ability should deal 3 damage to a ground unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['luke-skywalker#do-you-read-me'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tie-bomber']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalkerDoYouReadMe);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.lukeSkywalker]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(3);
        });
    });
});