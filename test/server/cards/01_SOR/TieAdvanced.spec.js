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
            });

            it('can give two experience to a unit', function () {
                this.player1.clickCard(this.tieAdvanced);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
                this.player1.clickCard(this.atst);

                expect(this.atst).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('can give two experience to a unit that already has an experience', function () {
                this.player1.clickCard(this.tieAdvanced);
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
                this.player1.clickCard(this.tielnFighter);

                expect(this.tielnFighter).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });
        });
    });
});
