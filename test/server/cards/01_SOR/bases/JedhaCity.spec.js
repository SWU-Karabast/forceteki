describe('Jedha City', function() {
    integration(function() {
        describe('Jedha City\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'jedha-city',
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent']
                    }
                });
            });

            it('should apply -4/0 to a unit for the phase', function () {
                this.player1.clickCard(this.jedhaCity);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.isbAgent, this.pykeSentinel]);

                this.player1.clickCard(this.atst);
                expect(this.atst.getPower()).toBe(2);

                // move to next phase and confirm effect is ended
                this.moveToNextActionPhase();
                expect(this.atst.getPower()).toBe(6);
            });
        });
    });
});
