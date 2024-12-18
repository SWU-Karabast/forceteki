describe('41st Elite Corps', function() {
    integration(function(contextRef) {
        describe('41st Elite Corps\'s ability', function () {
            it('should give +0/+3 when Coordinate is active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['republic-commando'],
                        groundArena: ['41st-elite-corps', 'clone-heavy-gunner']
                    }
                });

                const { context } = contextRef;

                // When Coordinate is not active
                expect(context._41stEliteCorps.getPower()).toBe(3);
                expect(context._41stEliteCorps.getHp()).toBe(3);

                context.player1.clickCard(context.republicCommando);

                // When Coordinate is active
                expect(context._41stEliteCorps.getPower()).toBe(3);
                expect(context._41stEliteCorps.getHp()).toBe(6);
            });
        });
    });
});
