describe('Mid Rim Sharpshooter', function () {
    integration(function (contextRef) {
        it('should allow the player to pay 1 resource to make an opponent discard a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mid-rim-sharpshooter'],
                    resources: 7,
                },
                player2: {
                    hand: ['consular-security-force', 'vanquish']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.midRimSharpshooter);
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;

            context.player1.clickPrompt('Trigger');

            expect(context.player2).toHavePrompt('Choose a card to discard for Mid Rim Sharpshooter\'s effect');
            context.player2.clickCard(context.consularSecurityForce);

            // Assert the pay resource
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 1);

            // Assert the discard
            expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow the player to pay 1 resource to make an opponent discard a card even if they don\'t have any cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mid-rim-sharpshooter'],
                    resources: 7,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.midRimSharpshooter);
            const exhaustedResourceCount = context.player1.exhaustedResourceCount;

            context.player1.clickPrompt('Trigger');

            // Assert the pay resource
            expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourceCount + 1);

            // Assert the discard
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing as the player does not have enough resources to pay for the ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mid-rim-sharpshooter'],
                    resources: 3,
                },
                player2: {
                    hand: ['consular-security-force', 'vanquish']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.midRimSharpshooter);
            expect(context.player2).toBeActivePlayer();
        });
    });
});