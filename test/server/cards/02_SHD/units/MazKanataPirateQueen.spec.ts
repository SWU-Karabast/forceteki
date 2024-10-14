describe('Maz Kanata, Pirate Queen', function() {
    integration(function() {
        describe('Maz Kanata\'s triggered ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'maz-kanata#pirate-queen'],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        hand: ['tieln-fighter']
                    }
                });
            });

            it('should give herself an Experience when another friendly unit is played', function () {
                // CASE 1: no upgrade when she is played
                this.player1.clickCard(this.mazKanata);
                expect(this.mazKanata.isUpgraded()).toBe(false);

                // CASE 2: opponent plays unit
                this.player2.clickCard(this.tielnFighter);
                expect(this.mazKanata.isUpgraded()).toBe(false);

                // CASE 3: we play unit
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.mazKanata).toHaveExactUpgradeNames(['experience']);

                // CASE 4: we deploy a leader
                this.player2.passAction();
                this.player1.clickCard(this.bobaFett);
                expect(this.mazKanata).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
