describe('Admiral Ozzel As Clumsy As He Is Stupid', function() {
    integration(function(contextRef) {
        it('Admiral Ozzel\'s ability should make opponent discard a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'atst', 'takedown'],
                },
                player2: {
                    groundArena: ['admiral-ozzel#as-clumsy-as-he-is-stupid'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.admiralOzzel);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard');
        });

        it('Admiral Ozzel\'s ability should make opponent discard a card when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                },
                player2: {
                    hand: ['wampa', 'atst'],
                    groundArena: ['admiral-ozzel#as-clumsy-as-he-is-stupid'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.admiralOzzel);

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player2).not.toHaveChooseNothingButton();
            expect(context.player2).not.toHavePassAbilityButton();

            context.player2.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard');
        });
    });
});