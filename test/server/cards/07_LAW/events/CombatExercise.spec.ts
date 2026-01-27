describe('Combat Exercise', function () {
    integration(function (contextRef) {
        it('Should exhaust a friendly unit and give two experience tokens when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['combat-exercise'],
                    groundArena: ['greedo#slow-on-the-draw', 'boba-fett#for-a-price'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['toro-calican#ambitious-upstart']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.combatExercise);

            // Should be able to select friendly units
            expect(context.player1).toBeAbleToSelectExactly([context.greedoSlowOnTheDraw, context.bobaFettForAPrice, context.cartelSpacer]);

            context.player1.clickCard(context.greedoSlowOnTheDraw);
            expect(context.greedoSlowOnTheDraw).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.greedoSlowOnTheDraw.exhausted).toBeTrue();
        });

        it('Should not do anything when there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['combat-exercise'],
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['boba-fett#for-a-price']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.combatExercise);

            context.player1.clickPrompt('Play anyway');

            expect(context.combatExercise).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});