describe('Weakness', function() {
    integration(function(contextRef) {
        describe('Basics', function () {
            it('is correctly created and attached in a test setup', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['weakness']
                        }]
                    }
                });

                const { context } = contextRef;

                // Verify it gives the -1/-1 upgrade stats
                expect(context.battlefieldMarine.getPower()).toBe(2);
                expect(context.battlefieldMarine.getHp()).toBe(2);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            });
        });
    });
});