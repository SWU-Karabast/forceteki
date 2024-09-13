describe('Vanguard Infantry', function() {
    integration(function() {
        describe('Vanguard Infantry\'s when defeated ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        groundArena: ['battlefield-marine', 'vanguard-infantry'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give an experience token to a unit when defeated in combat', function () {
                this.player1.clickCard(this.vanguardInfantry);
                this.player1.clickCard(this.wampa);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.wampa, this.cartelSpacer]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer).toHaveExactUpgradeNames(['experience']);
            });

            it('should give an experience token to a unit when defeated by an ability', function () {
                this.player1.clickCard(this.vanquish);
                this.player1.clickCard(this.vanguardInfantry);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine, this.wampa, this.cartelSpacer]);
                expect(this.player1).toHaveEnabledPromptButton('Pass ability');

                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should be able to be passed', function () {
                this.player1.clickCard(this.vanguardInfantry);
                this.player1.clickCard(this.wampa);
                this.player1.clickPrompt('Pass ability');

                expect(this.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(this.wampa).toHaveExactUpgradeNames([]);
                expect(this.cartelSpacer).toHaveExactUpgradeNames([]);
            });
        });
    });
});
