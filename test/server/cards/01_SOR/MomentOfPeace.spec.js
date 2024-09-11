describe('Moment of Peace', function() {
    integration(function() {
        describe('Moment of Peace\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['shield'] }]
                    }
                });
            });

            it('can give a shield to a unit', function () {
                this.player1.clickCard(this.momentOfPeace);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa).toHaveExactUpgradeNames(['shield']);
            });

            it('can give a shield to a unit that already has a shield', function () {
                this.player1.clickCard(this.momentOfPeace);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer).toHaveExactUpgradeNames(['shield', 'shield']);
            });
        });
    });
});
