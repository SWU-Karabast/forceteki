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

                this.confiscate = this.player1.findCardByName('confiscate');
                this.entrenched = this.player1.findCardByName('entrenched');
                this.academyTraining = this.player2.findCardByName('academy-training');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');
            });

            it('can defeat an upgrade on a friendly or enemy unit', function () {
                this.player1.clickCard(this.confiscate);
                expect(this.player1).toBeAbleToSelectExactly([this.entrenched, this.academyTraining]);

                this.player1.clickCard(this.academyTraining);
                expect(this.interceptor.upgrades.length).toBe(0);
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

                this.confiscate = this.player1.findCardByName('confiscate');
                this.entrenched = this.player1.findCardByName('entrenched');
                this.wampa = this.player2.findCardByName('wampa');
            });

            it('when played on a friendly upgrade attached to an enemy unit will cause the upgrade to be in friendly discard', function () {
                this.player1.clickCard(this.entrenched);
                // card attaches automatically as there's only one target

                this.player2.passAction();

                this.player1.clickCard(this.confiscate);
                expect(this.wampa.upgrades.length).toBe(0);

                // this expectation will automatically check that entrenched is in the owning player's discard
                expect(this.entrenched).toBeInLocation('discard');
            });
        });

        // TODO SNOKE: add a test here to confirm that a unit is defeated when an upgrade giving +hp is removed
    });
});
