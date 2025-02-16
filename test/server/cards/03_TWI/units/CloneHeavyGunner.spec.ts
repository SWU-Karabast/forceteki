describe('Clone Heavy Gunner', function() {
    integration(function(contextRef) {
        it('Clone Heavy Gunner\'s constant Coordinate ability should give +2/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['clone-heavy-gunner', 'battlefield-marine'],
                    hand: ['wing-leader']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            // Coordinate offline
            expect(context.cloneHeavyGunner.getPower()).toBe(1);

            context.player1.clickCard(context.wingLeader);

            // Coordinate online
            expect(context.cloneHeavyGunner.getPower()).toBe(3);
        });
    });
});
