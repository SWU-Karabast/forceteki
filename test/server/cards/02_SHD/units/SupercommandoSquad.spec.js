describe('Supercommando Squad', function() {
    integration(function() {
        describe('Supercommando Squad\' ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'supercommando-squad', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedha-agitator'],
                    }
                });
            });
            it('should give it sentinel only as long as it is upgraded', function () {
                this.player1.pass();

                this.player2.clickCard(this.wampa);
                //Supercommando Squad automatically selected due to sentinel

                expect(this.player1).toBeActivePlayer();
                //no damage because of shield
                expect(this.supercommandoSquad.damage).toBe(0);
                expect(this.supercommandoSquad.isUpgraded()).toBe(false);
                expect(this.wampa.damage).toBe(4);

                this.player1.pass();

                this.player2.clickCard(this.jedhaAgitator);

                //player 2 should be able to select base and unit because supercommando squad is not sentinel anymore
                expect(this.player2).toBeAbleToSelectExactly([this.supercommandoSquad, this.p1Base]);

                this.player2.clickCard(this.p1Base);
            });
        });
    });
});
