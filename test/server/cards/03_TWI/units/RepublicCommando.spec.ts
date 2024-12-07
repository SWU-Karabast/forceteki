describe('Republic Commando', function() {
    integration(function(contextRef) {
        describe('Republic Commando\'s ability', function () {
            it('should grant Saboteur when Coordinate active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['332nd-stalwart', 'republic-commando', 'clone-heavy-gunner']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Unit has Saboteur when Coordinate is active
                context.player1.clickCard(context.republicCommando);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not grant Saboteur when Coordinate is not active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['republic-commando', 'clone-heavy-gunner']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Unit does not have Saboteur when Coordinate is not active and must attack the Sentinel
                context.player1.clickCard(context.republicCommando);
                expect(context.pykeSentinel.damage).toBe(2);
                expect(context.republicCommando.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
