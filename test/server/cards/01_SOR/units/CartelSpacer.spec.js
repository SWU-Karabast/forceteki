describe('', function() {
    integration(function() {
        describe('Cartel Spacer\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer', 'gamorrean-guards'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'partisan-insurgent'],
                    }
                });
            });

            it('should not exhaust enemy unit', function () {
                // no cunning ally : cartel spacer does not exhaust anybody
                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('space arena');
                expect(this.player2).toBeActivePlayer();
                expect(this.atst.exhausted).toBeFalse();
                expect(this.battlefieldMarine.exhausted).toBeFalse();
                expect(this.partisanInsurgent.exhausted).toBeFalse();
            });

            it('should exhaust enemy unit', function() {
                // play a cunning ally to enable cartel spacer
                this.player1.clickCard(this.gamorreanGuards);
                expect(this.player2).toBeActivePlayer();
                this.player2.pass();

                // exhaust battlefield marine
                this.player1.clickCard(this.cartelSpacer);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.partisanInsurgent]);
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player2).toBeActivePlayer();
                expect(this.battlefieldMarine.exhausted).toBeTrue();
            });
        });
    });
});
