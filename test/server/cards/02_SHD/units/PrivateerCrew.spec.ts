describe('Privateer Crew', function() {
    integration(function(contextRef) {
        describe('Privateer Crew\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['privateer-crew'],
                    },
                    player2: {}
                });
            });

            it('should not give himself 3 experience while played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.privateerCrew);
                expect(context.player2).toBeActivePlayer();
                expect(context.privateerCrew.isUpgraded()).toBeFalse();
            });
        });

        describe('Privateer Crew\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        resources: ['privateer-crew', 'battlefield-marine', 'echo-base-defender', 'tech#source-of-insight', 'daring-raid', 'krayt-dragon', 'atst', 'covert-strength', 'commission', 'hunting-nexu'],
                    },
                    player2: {}
                });
            });

            it('should give himself 3 experience while played from resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.privateerCrew);
                expect(context.player2).toBeActivePlayer();
                expect(context.privateerCrew).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
        });
    });
});
