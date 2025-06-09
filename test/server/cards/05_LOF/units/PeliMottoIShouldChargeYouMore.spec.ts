describe('Peli Motto, I Should Charge You More', () => {
    integration(function (contextRef) {
        it('Peli Motto\'s on attack ability should give an Experience token to a friendly Vehicle or Droid unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'peli-motto#i-should-charge-you-more', 'r2d2#ignoring-protocol', 'atst']
                },
                player2: {
                    groundArena: ['ig11#i-cannot-be-captured']
                }
            });

            const { context } = contextRef;

            // Attack with Peli Motto
            context.player1.clickCard(context.peliMotto);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.r2d2]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.r2d2);

            expect(context.player2).toBeActivePlayer();
            expect(context.r2d2).toHaveExactUpgradeNames(['experience']);
        });
    });
});