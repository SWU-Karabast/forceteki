describe('Clone Heavy Gunner', function() {
    integration(function(contextRef) {
        it('Clone Heavy Gunner\'s constant Coordinate ability should give +2/+0', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['clone-heavy-gunner', 'battlefield-marine'],
                    spaceArena: ['wing-leader']
                }
            });

            const { context } = contextRef;

            expect(context.cloneHeavyGunner.getPower()).toBe(3);
        });

        // TODO THIS PR: merge these tests
        it('Clone Heavy Gunner\'s constant Coordinate ability should do nothing if fewer than 3 units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['clone-heavy-gunner'],
                    spaceArena: ['wing-leader'],
                }
            });

            const { context } = contextRef;

            expect(context.cloneHeavyGunner.getPower()).toBe(1);
        });
    });
});
