describe('Disarm', function() {
    integration(function() {
        describe('Disarm\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['disarm'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: [
                            { card: 'tieln-fighter', upgrades: ['academy-training'] },
                            { card: 'cartel-spacer', upgrades: ['entrenched'] }
                        ]
                    }
                });
            });

            it('should apply -4/0 to an enemy unit for the phase', function () {
                this.player1.clickCard(this.disarm);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.tielnFighter, this.cartelSpacer]);

                this.player1.clickCard(this.atst);
                expect(this.atst.getPower()).toBe(2);

                // move to next phase and confirm effect is ended
                this.moveToNextActionPhase();
                expect(this.atst.getPower()).toBe(6);
            });

            // TODO SNOKE: maybe migrate these to their own test suite once we do the full stat effects PR
            it('should not reduce a unit\'s power below 0', function () {
                this.player1.clickCard(this.disarm);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.tielnFighter, this.cartelSpacer]);

                this.player1.clickCard(this.isbAgent);
                expect(this.isbAgent.getPower()).toBe(0);
            });

            it('should reduce a unit\'s power to 0 accounting for additive effects', function () {
                this.player1.clickCard(this.disarm);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.tielnFighter, this.cartelSpacer]);

                this.player1.clickCard(this.tielnFighter);
                expect(this.tielnFighter.getPower()).toBe(0);
            });

            it('should reduce a unit\'s power to above 0 if additive effects are big enough', function () {
                this.player1.clickCard(this.disarm);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.tielnFighter, this.cartelSpacer]);

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.getPower()).toBe(1);
            });
        });
    });
});
