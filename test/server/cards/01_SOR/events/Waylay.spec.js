describe('Waylay', function() {
    integration(function() {
        describe('Waylay\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'pyke-sentinel', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }]
                    }
                });
            });

            it('can return a friendly or enemy unit to its owner\'s hand', function () {
                this.player1.clickCard(this.waylay);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.pykeSentinel, this.imperialInterceptor, this.superlaserTechnician]);

                this.player1.clickCard(this.superlaserTechnician);
                expect(this.superlaserTechnician).toBeInLocation('hand', this.player2);
            });
        });

        describe('Waylay\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched'],
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['wampa'],
                    }
                });
            });

            it('when played on a friendly upgraded unit, it will cause the upgrade to be in the owner\'s discard', function () {
                this.player1.clickCard(this.entrenched);
                // card attaches automatically as there's only one target

                // card selects automatically as there's only one target
                this.player2.clickCard(this.waylay);
                expect(this.wampa).toBeInLocation('hand', this.player2);

                // this expectation will automatically check that entrenched is in the owning player's discard
                expect(this.entrenched).toBeInLocation('discard', this.player1);
            });
        });
    });
});
