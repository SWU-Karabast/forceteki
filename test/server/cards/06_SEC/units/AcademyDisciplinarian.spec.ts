describe('Academy Disciplinarian', function () {
    integration(function (contextRef) {
        it('Academy Disciplinarian\'s ability should be able to deal 1 damage to a friendly unit with 2 or less power and ready it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['academy-disciplinarian'],
                    groundArena: [{ card: 'yoda#old-master', exhausted: true }, 'battlefield-marine']
                },
                player2: {
                    groundArena: ['specforce-soldier']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.academyDisciplinarian);

            expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.yoda);

            expect(context.yoda.damage).toBe(1);
            expect(context.yoda.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });
    });
});