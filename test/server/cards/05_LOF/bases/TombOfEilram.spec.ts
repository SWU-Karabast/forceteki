describe('Tomb of Eilram\'s ability', function() {
    integration(function(contextRef) {
        it('should not be selectable if you have no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'tomb-of-eilram'
                }
            });

            const { context } = contextRef;

            expect(context.tombOfEilram).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should not be selectable if you have no ready units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'tomb-of-eilram',
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }]
                }
            });

            const { context } = contextRef;

            expect(context.tombOfEilram).not.toHaveAvailableActionWhenClickedBy(context.player1);
            expect(context.player1).toBeActivePlayer();
        });

        it('should gain the Force when used', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'tomb-of-eilram',
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2.hasTheForce).toBe(false);

            context.player1.clickCard(context.tombOfEilram);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
            expect(context.player2).toBeActivePlayer();
            expect(context.getChatLogs(1)).toContain('player1 uses player1\'s base, exhausting Battlefield Marine to gain the Force');
        });

        it('should be able to gain the force multiple times', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'tomb-of-eilram',
                    groundArena: ['battlefield-marine', 'moisture-farmer']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2.hasTheForce).toBe(false);

            context.player1.clickCard(context.tombOfEilram);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.moistureFarmer]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();
            context.player1.setHasTheForce(false);
            context.player1.clickCard(context.tombOfEilram);
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer]);
            context.player1.clickCard(context.moistureFarmer);
        });
    });
});
