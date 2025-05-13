describe('Darth Tyranus, Servant of Sidious', function() {
    integration(function(contextRef) {
        it('Darth Tyranus\'s ability should gain Ambush when the Force is with the player', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['darth-tyranus#servant-of-sidious'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard('darth-tyranus#servant-of-sidious');

            // resolve Shielded, then Ambush
            context.player1.clickPrompt('Shielded');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper]);
            context.player1.clickCard(context.sundariPeacekeeper);
            expect(context.player2).toBeActivePlayer();
            expect(context.sundariPeacekeeper.damage).toBe(4);
        });

        it('should lose Ambush when the Force changes sides', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['darth-tyranus#servant-of-sidious'],
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard('darth-tyranus#servant-of-sidious');
            expect(context.player2).toBeActivePlayer();
        });
    });
});