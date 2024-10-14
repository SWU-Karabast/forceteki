describe('Confiscate', function() {
    integration(function() {
        describe('Confiscate\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }]
                    }
                });
            });

            it('can defeat an upgrade on a friendly or enemy unit', function () {
                this.player1.clickCard(this.confiscate);
                expect(this.player1).toBeAbleToSelectExactly([this.entrenched, this.academyTraining]);

                this.player1.clickCard(this.academyTraining);
                expect(this.imperialInterceptor.isUpgraded()).toBe(false);
                expect(this.academyTraining).toBeInLocation('discard');
            });
        });

        describe('Confiscate\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate', 'entrenched'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('when played on a friendly upgrade attached to an enemy unit will cause the upgrade to be in friendly discard', function () {
                this.player1.clickCard(this.entrenched);
                // card attaches automatically as there's only one target

                this.player2.passAction();

                this.player1.clickCard(this.confiscate);
                expect(this.wampa.isUpgraded()).toBe(false);

                // this expectation will automatically check that entrenched is in the owning player's discard
                expect(this.entrenched).toBeInLocation('discard', this.player1);
            });
        });
    });
});
