describe('Waylay', function() {
    integration(function() {
        describe('Waylay\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['waylay', 'waylay'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        hand: ['entrenched'],
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });
            });

            it('can return a friendly or enemy unit to its owner\'s hand', function () {
                this.player1.clickCard('waylay');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.pykeSentinel, this.imperialInterceptor, this.superlaserTechnician]);

                this.player1.clickCard(this.superlaserTechnician);
                expect(this.superlaserTechnician).toBeInLocation('hand', this.player2);
            });

            it('should allow the player to select a friendly unit to return to hand and should remove damage and be playable', function () {
                this.pykeSentinel.damage = 2;
                this.pykeSentinel.exhausted = false; // Making sure it doesn't retain state of unexhausted

                this.player1.passAction();
                this.player2.clickCard('entrenched'); // Providing ownership
                this.player2.clickCard(this.pykeSentinel);

                this.player1.clickCard('waylay');
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.pykeSentinel, this.superlaserTechnician, this.imperialInterceptor]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel).toBeInLocation('hand', this.player1);
                expect(this.entrenched).toBeInLocation('discard', this.player2);

                this.player2.passAction();
                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel.damage).toBe(0); // Just making sure that the damage is not added back
                expect(this.pykeSentinel.isUpgraded()).toBe(false);

                expect(this.pykeSentinel).toBeInLocation('ground arena', this.player1);
                expect(this.pykeSentinel.exhausted).toBe(true); // Does not retain state when returned to hand
            });
        });
    });
});
