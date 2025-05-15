describe('Mystic Monastery\'s ability', function() {
    integration(function(contextRef) {
        it('should gain the Force when used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'mystic-monastery'
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2.hasTheForce).toBe(false);

            context.player1.clickCard(context.mysticMonastery);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be used three times per game', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'mystic-monastery'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.mysticMonastery);
            expect(context.getChatLogs(1)).toContain('player1 uses Mystic Monastery to gain the Force (2 uses left).');

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();
            context.player1.setHasTheForce(false);
            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.mysticMonastery);
            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();
            context.player1.setHasTheForce(false);

            context.player1.clickCard(context.mysticMonastery);
            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();
            context.player1.setHasTheForce(false);

            // It should no longer have an action after three uses
            expect(context.player1).not.toBeAbleToSelect(context.mysticMonastery);
        });
    });
});
