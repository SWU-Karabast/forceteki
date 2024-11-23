describe('Cassian Andor, Rebellions Are Built On Hope', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cassian-andor#rebellions-are-built-on-hope'],
                    },
                    player2: {}
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
                        resources: ['cassian-andor#rebellions-are-built-on-hope', 'battlefield-marine', 'echo-base-defender', 'tech#source-of-insight', 'daring-raid', 'krayt-dragon', 'atst', 'covert-strength', 'commission', 'hunting-nexu'],
                    },
                    player2: {}
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
