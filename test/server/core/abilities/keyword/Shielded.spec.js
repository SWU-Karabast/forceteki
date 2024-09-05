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
                expect(this.craftySmuggler.upgrades.length).toBe(1);
                expect(this.craftySmuggler.upgrades[0].title).toBe('Shield');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
