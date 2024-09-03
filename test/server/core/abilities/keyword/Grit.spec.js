describe('Grit keyword', function() {
    integration(function() {
        describe('When a unit with the Grit keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'scout-bike-pursuer', damage: 2 }],
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                    }
                });
            });

            it('is damaged, power should be increased by damage amount', function () {
                expect(this.scoutBikePursuer.damage).toBe(2);
                expect(this.scoutBikePursuer.power).toBe(3);

                this.player2.setActivePlayer();
                this.player2.clickCard(this.regionalGovernor);
                this.player2.clickCard(this.scoutBikePursuer);

                expect(this.regionalGovernor.damage).toBe(3);
            });

            it('has no damage, it should not have increased power', function () {
                this.scoutBikePursuer.damage = 0;
                expect(this.scoutBikePursuer.power).toBe(1);
            });
        });
    });
});
