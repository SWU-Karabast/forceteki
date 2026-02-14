describe('The Max Rebo Band, Jatz-Wailers', () => {
    integration(function(contextRef) {
        describe('Triggered ability', function() {
            it('creates a credit token at the start of the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['the-max-rebo-band#jatzwailers']
                    }
                });

                const { context } = contextRef;

                // Start with no credit tokens
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(0);

                // Move to regroup phase to trigger ability
                context.moveToRegroupPhase();

                // Ability should trigger and create a credit token for P1
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(context.getChatLog()).toEqual('player1 uses The Max Rebo Band to create a Credit token');
            });
        });
    });
});