describe('Temple of Destruction\'s ability', function() {
    integration(function(contextRef) {
        it('should not give the Force when a friendly unit deals less than 3 combat damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['guardian-of-the-whills']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.guardianOfTheWhills);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hasTheForce).toBe(false);
        });

        it('should not give the Force when an enemy unit deals 3 or more combat damage to a friendly base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction'
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2.hasTheForce).toBe(false);
        });

        it('should give the Force when a friendly unit deals 3 or more combat damage to an enemy base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
        });
    });
});
