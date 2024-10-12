describe('Phase-iii Dark Trooper', function () {
    integration(function () {
        describe('Phase-iii Dark Trooper\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['phaseiii-dark-trooper'],
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol'],
                    }
                });
            });

            it('should give experience token to Phase-iii Dark Trooper when it receives damage.', function () {
                this.player1.clickCard(this.phaseiiiDarkTrooper);
                this.player1.clickCard(this.r2d2);

                // check board state
                expect(this.phaseiiiDarkTrooper.damage).toBe(1);
                expect(this.phaseiiiDarkTrooper).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
