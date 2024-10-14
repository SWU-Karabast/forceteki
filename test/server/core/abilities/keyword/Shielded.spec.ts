describe('Shielded keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Shielded keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['crafty-smuggler']
                    }
                });
            });

            it('enters play, it receives a shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });

    // TODO test that a card that is bounced back to hand (i.e. Waylay) doesn't receive a second Shield when replayed
});
