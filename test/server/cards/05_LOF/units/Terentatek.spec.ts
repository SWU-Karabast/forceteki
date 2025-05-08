describe('Terentatek', function() {
    integration(function(contextRef) {
        it('Terentatek should gain Ambush when opponent controls a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['terentatek']
                },
                player2: {
                    groundArena: ['jedi-guardian'] // Force unit
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.terentatek);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.jediGuardian]);
            context.player1.clickCard(context.jediGuardian);

            expect(context.jediGuardian.damage).toBe(5);
        });

        it('Terentatek should not have Ambush when opponent does not control a Force unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['terentatek'],
                    groundArena: ['jedi-knight'] // Force unit
                },
                player2: {
                    groundArena: ['first-order-stormtrooper'] // Non-Force unit
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.terentatek);
            expect(context.player2).toBeActivePlayer();
        });
    });
});