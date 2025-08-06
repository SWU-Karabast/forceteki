describe('minimum repro', function() {
    undoIntegration(function (ctx) {
        describe('suite', function () {
            beforeEach(async function () {
                await ctx.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        resources: 2
                    },
                    player2: {
                        hand: ['battlefield-marine'],
                        resources: 2
                    }
                });
            });

            it('is the first spec', function () {
                ctx.snapshot.takeManualSnapshot(ctx.context.player1Object);
                expect(true).toBe(true);
            });

            it('is the second spec', function () {
                ctx.snapshot.takeManualSnapshot(ctx.context.player1Object);
                expect(true).toBe(true);
            });
        });
    });
});