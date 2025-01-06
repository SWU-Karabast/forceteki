describe('DJ, Blatant Thief', function() {
    integration(function(contextRef) {
        describe('DJ\'s when played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'chopper-base',
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 10
                    }
                });
            });

            it('should take control of a resource until he leaves play', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.djBlatantThief);
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.dj);
                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(10);
            });
        });
    });
});
