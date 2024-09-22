describe('Obi-Wan Kenobi, Following Fate', function() {
    integration(function() {
        describe('Obi-Wan Kenobi, Following Fate\'s when defeated ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        groundArena: ['obiwan-kenobi#following-fate', 'yoda#old-master', 'consular-security-force']
                    }
                });
            });

            it('should give 2 experience tokens to another friendly unit, and draw the controller a card only if that unit has the "Force" trait', function () {
                this.player1.clickCard(this.vanquish);
                this.player1.clickCard(this.obiwanKenobi);

                expect(this.player2).toBeAbleToSelectExactly([this.yoda, this.consularSecurityForce]);
                let handSizeBeforeTriggerResolves = this.player2.hand.length;
                this.player2.clickCard(this.consularSecurityForce);

                expect(this.consularSecurityForce).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(this.player2.hand.length).toBe(handSizeBeforeTriggerResolves);
            });

            it('should draw the controller a card if the target unit has the "Force" trait', function () {
                this.player1.clickCard(this.vanquish);
                this.player1.clickCard(this.obiwanKenobi);

                let handSizeBeforeTriggerResolves = this.player2.hand.length;
                this.player2.clickCard(this.yoda);

                expect(this.yoda).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(this.player2.hand.length).toBe(handSizeBeforeTriggerResolves + 1);
            });
        });
    });
});
