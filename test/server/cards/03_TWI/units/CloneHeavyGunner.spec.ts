describe('Clone Heavy Gunner', function() {
    integration(function(contextRef) {
        it('Clone Heavy Gunner\'s constant Coordinate ability should give +2/+0', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['clone-heavy-gunner', 'battlefield-marine'],
                    hand: ['wing-leader']
                }
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
