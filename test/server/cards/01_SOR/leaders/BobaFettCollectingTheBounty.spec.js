describe('Boba Fett, Collecting the Bounty', function() {
    integration(function() {
        describe('Boba Fett\'s leader ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall', 'cantina-bouncer'],
                        groundArena: ['death-star-stormtrooper'],
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'dagobah-swamp',
                        resources: 6,
                    },
                    player2: {
                        groundArena: ['cell-block-guard'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    },
                });
            });

            it('should ready a resource when an enemy unit leaves play - defeated', function() {
                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.cellBlockGuard);

                expect(this.player1.countSpendableResources()).toBe(1);
                expect(this.bobaFett.exhausted).toBeTrue();
            });

            it('should ready a resource when an enemy unit leaves play - returned to hand', function() {
                this.player1.clickCard(this.cantinaBouncer);
                this.player1.clickCard(this.cellBlockGuard);

                expect(this.player1.countSpendableResources()).toBe(2);
                expect(this.bobaFett.exhausted).toBeTrue();
            });

            it('should ready a resource when an enemy leader unit leaves play', function() {
                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.lukeSkywalker);

                expect(this.player1.countSpendableResources()).toBe(1);
                expect(this.bobaFett.exhausted).toBeTrue();
            });

            it('should not ready a resource if there are no exhausted resources', function() {
                this.player1.clickCard(this.deathStarStormtrooper);

                expect(this.bobaFett.exhausted).toBeFalse();
            });

            it('should not ready a resource when a friendly unit leaves play', function() {
                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.deathStarStormtrooper);

                expect(this.player1.countSpendableResources()).toBe(0);
                expect(this.bobaFett.exhausted).toBeFalse();
            });
        });

        describe('Boba Fett\'s leader unit ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true },
                        base: 'spice-mines',
                        resources: 5,
                    },
                    player2: {
                        groundArena: ['cell-block-guard'],
                    }
                });
            });

            it('should ready 2 resources when Boba Fett completes an attack if an enemy unit left play this turn', function() {
                this.player1.clickCard(this.wampa);
                this.player2.passAction();
                this.player1.clickCard(this.bobaFett);

                expect(this.player1.countSpendableResources()).toBe(3);
            });

            it('should not ready resources if Boba Fett dies while attacking, even if an enemy unit left play this turn', function() {
                this.bobaFett.damage = 4;
                this.player1.clickCard(this.wampa);
                this.player2.passAction();
                this.player1.clickCard(this.bobaFett);

                expect(this.player1.countSpendableResources()).toBe(1);
            });
        });
    });
});
