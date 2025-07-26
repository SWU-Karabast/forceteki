describe('You Have Failed Me', function() {
    integration(function(contextRef) {
        it('You Have Failed Me\'s ability should defeat a friendly unit to ready a friendly unit with 5 or less power.', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['you-have-failed-me'],
                    groundArena: [{ card: 'darth-vader#twilight-of-the-apprentice', exhausted: true }, { card: 'atst', exhausted: true }, 'wampa'],
                    spaceArena: ['tie-bomber']
                },
                player2: {
                    groundArena: [{ card: 'pyke-sentinel', exhausted: true }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.youHaveFailedMe);

            expect(context.player1).toBeAbleToSelectExactly([context.tieBomber, context.atst, context.darthVader, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.tieBomber, context.darthVader]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.darthVader);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard');
            expect(context.darthVader.exhausted).toBeFalse();
        });
    });
});