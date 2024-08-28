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
            });
        });
    });
});
