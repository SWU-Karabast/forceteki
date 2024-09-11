describe('Shielded keyword', function() {
    integration(function() {
        describe('When a unit with the Shielded keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['crafty-smuggler']
                    }
                });
            });

            it('enters play, it receives a shield', function () {
                this.player1.clickCard(this.craftySmuggler);
                expect(this.craftySmuggler).toHaveExactUpgradeNames(['shield']);
                expect(this.player2).toBeActivePlayer();
            });
        });
    });

    //TODO test that a card that is bounced back to hand (i.e. Waylay) doesn't receive a second Shield when replayed
});
