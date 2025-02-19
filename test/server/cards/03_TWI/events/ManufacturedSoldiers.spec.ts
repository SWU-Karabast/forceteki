describe('Manufactured Soldiers', function () {
    integration(function (contextRef) {
        it('Manufactured Soldiers\'s ability should create two Clone Tropper tokens or three Battle Droid tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['manufactured-soldiers'],
                }
            });
            const { context } = contextRef;

            const reset = () => {
                context.player1.moveCard(context.manufacturedSoldiers, 'hand');
                context.player2.passAction();
            };

            // Scenario 1: Create 2 Clone Trooper tokens
            context.player1.clickCard(context.manufacturedSoldiers);
            expect(context.player1).toHaveExactPromptButtons([
                'Create 2 Clone Trooper tokens',
                'Create 3 Battle Droid tokens',
            ]);

            context.player1.clickPrompt('Create 2 Clone Trooper tokens');

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena');

            reset();

            // Scenario 2: Create 3 Battle Droid tokens
            context.player1.clickCard(context.manufacturedSoldiers);
            expect(context.player1).toHaveExactPromptButtons([
                'Create 2 Clone Trooper tokens',
                'Create 3 Battle Droid tokens',
            ]);

            context.player1.clickPrompt('Create 3 Battle Droid tokens');

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(3);
            expect(battleDroids).toAllBeInZone('groundArena');
        });
    });
});
