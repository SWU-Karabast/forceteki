describe('Privateer Scyk', function() {
    integration(function(contextRef) {
        describe('Privateer Scyk\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['privateer-scyk'],
                        groundArena: ['gamorrean-guards'],
                    },
                    player2: {
                    }
                });
            });

            it('should give it shielded while there is a friendly Cunning unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.privateerScyk);
                expect(context.privateerScyk).toHaveExactUpgradeNames(['shield']);
            });
        });

        describe('Privateer Scyk\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['privateer-scyk'],
                    },
                    player2: {
                        groundArena: ['gamorrean-guards'],
                    }
                });
            });

            it('should not give it shielded while there is not a friendly Cunning unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.privateerScyk);
                expect(context.privateerScyk.isUpgraded()).toBeFalse();
            });
        });
    });
});
