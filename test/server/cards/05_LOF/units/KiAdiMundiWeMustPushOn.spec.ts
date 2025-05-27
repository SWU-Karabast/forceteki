describe('Ki-Adi-Mundi, We Must Push On', () => {
    integration(function (contextRef) {
        it('Ki-Adi-Mundi\'s ability may allow the player to use the force. If they do, draw 2 cards', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kiadimundi#we-must-push-on'],
                    hasForceToken: true,
                    deck: ['ardent-sympathizer', 'ardent-sympathizer']
                }
            });

            const { context } = contextRef;

            // Play Ki-Adi-Mundi
            context.player1.clickCard(context.kiadimundi);

            expect(context.player1).toHavePassAbilityPrompt('Use The Force');
            context.player1.clickPrompt('Trigger');

            // Ensure the Force was used
            expect(context.player1.hasTheForce).toBe(false);

            // Player should have drawn 2 cards
            expect(context.player1.hand.length).toBe(2);
        });
    });
});