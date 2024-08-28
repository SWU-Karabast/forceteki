describe('Tie Avanced', function() {
    integration(function() {
        describe('Tie Avanced\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['tie-advanced'],
                        groundArena: ['wampa', 'atst', { card: 'tieln-fighter', upgrades: ['experience'] }],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.tieAdvanced = this.player1.findCardByName('tie-advanced');
                this.atst = this.player1.findCardByName('atst');
                this.tieLn = this.player1.findCardByName('tieln-fighter');
            });

            it('can give two experience to a unit', function () {
                this.player1.clickCard(this.tieAdvanced);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tieLn]);
                this.player1.clickCard(this.atst);

                expect(this.atst.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience']);
            });

            it('can give two experience to a unit that already has an experience', function () {
                this.player1.clickCard(this.tieAdvanced);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tieLn]);
                this.player1.clickCard(this.tieLn);

                expect(this.tieLn.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience', 'experience']);
            });
        });
    });
});
