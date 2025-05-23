
describe('Avar Kriss, Marshal of Starlight', function() {
    integration(function (contextRef) {
        describe('Avar Kriss\'s Leader side ability', function () {
            it('should give the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'avar-kriss#marshal-of-starlight',
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
                expect(context.avarKriss.exhausted).toBe(true);
            });

            it('should be triggerable even if the player already has the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'avar-kriss#marshal-of-starlight',
                        resources: 5,
                        hasForceToken: true
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
                expect(context.avarKriss.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
