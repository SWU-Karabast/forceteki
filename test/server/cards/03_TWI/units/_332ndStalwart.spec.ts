describe('332nd Stalwart', function() {
    integration(function(contextRef) {
        describe('332nd Stalwart\'s ability', function () {
            it('should give +1/+1 when Coordinate active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['republic-commando'],
                        groundArena: ['332nd-stalwart', 'clone-heavy-gunner']
                    }
                });

                const { context } = contextRef;

                // When Coordinate is not active
                expect(context._332ndStalwart.getPower()).toBe(1);
                expect(context._332ndStalwart.getHp()).toBe(2);

                context.player1.clickCard(context.republicCommando);

                // When Coordinate is active
                expect(context._332ndStalwart.getPower()).toBe(2);
                expect(context._332ndStalwart.getHp()).toBe(3);
            });
        });
    });
});
