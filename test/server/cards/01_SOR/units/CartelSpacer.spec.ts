describe('Cartel Spacer', function () {
    integration(function () {
        describe('Cartel Spacer\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'partisan-insurgent'],
                    }
                });
            });

            it('should not exhaust enemy unit if there is no Cunning ally', function () {
                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('space arena');
                expect(this.player2).toBeActivePlayer();

                expect(this.atst.exhausted).toBeFalse();
                expect(this.battlefieldMarine.exhausted).toBeFalse();
                expect(this.partisanInsurgent.exhausted).toBeFalse();
            });
        });

        describe('Cartel Spacer\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer'],
                        groundArena: ['gamorrean-guards'],
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine', 'partisan-insurgent'],
                    }
                });
            });

            it('should exhaust enemy unit when there is Cunning ally', function () {
                this.player1.clickCard(this.cartelSpacer);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.partisanInsurgent]);
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player2).toBeActivePlayer();

                expect(this.atst.exhausted).toBeFalse();
                expect(this.partisanInsurgent.exhausted).toBeFalse();
                expect(this.battlefieldMarine.exhausted).toBeTrue();
            });
        });
    });
});
