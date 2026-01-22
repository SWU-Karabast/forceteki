describe('Black Sun Cabalist', function() {
    integration(function(contextRef) {
        it('Black Sun Cabalist\'s when played ability should give an experience token to another friendly Underworld unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['black-sun-cabalist'],
                    groundArena: ['weequay-pirate', 'wampa'],
                },
                player2: {
                    groundArena: ['pyke-sentinel']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blackSunCabalist);

            expect(context.player1).toBeAbleToSelectExactly([context.weequayPirate]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.weequayPirate);
            expect(context.weequayPirate).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Black Sun Cabalist\'s when played ability should not trigger when there are no other friendly Underworld units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['black-sun-cabalist'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['pyke-sentinel']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blackSunCabalist);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
