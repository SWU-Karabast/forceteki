describe('Cassian Andor, Rebellions Are Built On Hope', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cassian-andor#rebellions-are-built-on-hope'],
                    },
                });
            });

            it('should not ready himself when played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cassianAndor);
                expect(context.player2).toBeActivePlayer();
                expect(context.cassianAndor.exhausted).toBeTrue();
            });
        });

        describe('Cassian Andor\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        resources: ['cassian-andor#rebellions-are-built-on-hope', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    },
                });
            });

            it('should ready himself while played from resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cassianAndor);
                expect(context.player2).toBeActivePlayer();
                expect(context.cassianAndor.exhausted).toBeFalse();
            });
        });
    });
});
