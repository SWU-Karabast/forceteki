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

                this.momentOfPeace = this.player1.findCardByName('moment-of-peace');
                this.wampa = this.player1.findCardByName('wampa');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');
            });

            it('can give a shield to a unit', function () {
                this.player1.clickCard(this.momentOfPeace);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['shield']);
            });

            it('can give a shield to a unit that already has a shield', function () {
                this.player1.clickCard(this.momentOfPeace);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['shield', 'shield']);
            });
        });
    });
});
