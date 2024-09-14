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
                            { card: 'tieln-fighter', upgrades: ['academy-training'] }]
                    }
                });
            });

            it('should apply -4/0 to an enemy unit for the phase', function () {
                this.player1.clickCard(this.disarm);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.tielnFighter]);

                this.player1.clickCard(this.atst);
                expect(this.atst.power).toBe(2);

                // move to next phase and confirm effect is ended
                this.moveToNextActionPhase();
                expect(this.atst.power).toBe(6);
            });
        });

        // TODO THIS PR: add a test here to confirm that - and + bonuses stack correctly if the value dips below 0 during the calculation
    });
});
