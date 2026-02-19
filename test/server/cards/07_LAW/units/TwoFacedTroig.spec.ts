describe('Two-Faced Troig', function() {
    integration(function(contextRef) {
        it('should allow opponent to take control and create 2 credit tokens when ability is used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['twofaced-troig'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            // Play Two-Faced Troig
            context.player1.clickCard(context.twofacedTroig);
            expect(context.player1).toHavePassAbilityPrompt('Give control of Two-Faced Troig to the opponent and create 2 Credit tokens');

            // Ability should trigger - let opponent take control
            context.player1.clickPrompt('Trigger');

            // Should create 2 credit tokens
            expect(context.player1.credits).toBe(2);
            // Troig should now be controlled by opponent
            expect(context.twofacedTroig).toBeInZone('groundArena', context.player2);
        });

        it('should be able to pass the ability and keep control of the unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['twofaced-troig'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            // Play Two-Faced Troig
            context.player1.clickCard(context.twofacedTroig);
            context.player1.clickPrompt('Pass');

            // Should not create credit tokens
            expect(context.player1.credits).toBe(0);
            // Troig should remain controlled by player1
            expect(context.twofacedTroig).toBeInZone('groundArena', context.player1);
        });
    });
});
