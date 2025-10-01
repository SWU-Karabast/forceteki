describe('Crosshair, Filled With Doubt', function() {
    integration(function(contextRef) {
        it('Crosshair\'s ability should deal 2 damage to the defending player\'s base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#filled-with-doubt', 'battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.crosshairFilledWithDoubt);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('Crosshair\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crosshair#filled-with-doubt', 'battlefield-marine']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.crosshairFilledWithDoubt);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});