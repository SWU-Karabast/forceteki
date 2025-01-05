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
                        resources: 10
                    }
                });
            });

            it('should give an experience token to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.djBlatantThief);
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(9);
            });
        });
    });
});
