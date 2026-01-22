describe('Black Sun Cabalist', function () {
    integration(function (contextRef) {
        it('Should give experience token to another friendly underworld unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['black-sun-cabalist'],
                    groundArena: ['greedo#slow-on-the-draw', 'boba-fett#for-a-price']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blackSunCabalist);

            expect(context.player1).not.toHavePassAbilityButton();

            // Should be able to select friendly underworld units
            expect(context.player1).toBeAbleToSelectExactly([context.greedoSlowOnTheDraw, context.bobaFettForAPrice]);

            context.player1.clickCard(context.greedoSlowOnTheDraw);
            expect(context.greedoSlowOnTheDraw).toHaveExactUpgradeNames(['experience']);
        });

        it('Should not be able to choose enemy underworld unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['black-sun-cabalist'],
                    groundArena: ['toro-calican#ambitious-upstart']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['boba-fett#for-a-price']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blackSunCabalist);

            // Should not have any unit to choose
            expect(context.player1).toBeAbleToSelectExactly([]);

            expect(context.toroCalicanAmbitiousUpstart).not.toHaveExactUpgradeNames(['experience']);
        });
    });
});
