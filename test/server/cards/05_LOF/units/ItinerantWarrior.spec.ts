describe('Itinerant Warrior', () => {
    integration(function (contextRef) {
        it('Itinerant Warrior\'s ability may allow the player to use the force. If they do, heal 3 damage from their base', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['itinerant-warrior'],
                    hasForceToken: true,
                    base: { card: 'echo-base', damage: 4 }
                }
            });

            const { context } = contextRef;

            // Play Itinerant Warrior
            context.player1.clickCard(context.itinerantWarrior);

            context.player1.clickPrompt('Shielded');

            // Check prompt for optional ability
            expect(context.player1).toHavePassAbilityPrompt('Use The Force');
            context.player1.clickPrompt('Trigger');

            // Ensure the Force was used
            expect(context.player1.hasTheForce).toBe(false);

            // Base should be healed by 3 damages
            expect(context.player1.base.damage).toBe(1);
        });
    });
});