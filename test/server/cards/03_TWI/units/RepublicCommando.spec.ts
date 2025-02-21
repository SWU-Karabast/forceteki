describe('Republic Commando', function() {
    integration(function(contextRef) {
        describe('Republic Commando\'s ability', function () {
            it('should grant Saboteur when Coordinate active', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['332nd-stalwart'],
                        groundArena: ['republic-commando', 'clone-heavy-gunner']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Unit does not have Saboteur when Coordinate is not active and must attack the Sentinel
                context.player1.clickCard(context.republicCommando);
                expect(context.pykeSentinel.damage).toBe(2);
                expect(context.republicCommando.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.moveToNextActionPhase();
                context.player1.clickCard(context._332ndStalwart);
                context.player2.passAction();

                // Unit has Saboteur when Coordinate is active
                context.player1.clickCard(context.republicCommando);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
