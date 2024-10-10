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
                        groundArena: ['viper-probe-droid', 'cell-block-guard', 'wampa'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    },
                });
            });

            it('should ready a resource when an enemy unit leaves play', function() {
                const reset = () => {
                    this.player2.passAction();
                    this.player1.setResourceCount(6);
                    this.bobaFett.exhausted = false;
                };

                // Case 1 - when defeating an enemy unit
                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.viperProbeDroid);

                expect(this.player1.countSpendableResources()).toBe(1);
                expect(this.bobaFett.exhausted).toBeTrue();

                // Case 2 - when returning an enemy unit to hand
                reset();

                this.player1.clickCard(this.cantinaBouncer);
                this.player1.clickCard(this.wampa);

                expect(this.player1.countSpendableResources()).toBe(2);
                expect(this.bobaFett.exhausted).toBeTrue();

                // Case 3 - when defeating an enemy leader unit
                reset();
                this.player1.moveCard(this.rivalsFall, 'hand');

                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.lukeSkywalker);

                expect(this.player1.countSpendableResources()).toBe(1);
                expect(this.bobaFett.exhausted).toBeTrue();

                // Case 4 - when there are no exhausted resources
                reset();

                this.player1.clickCard(this.deathStarStormtrooper);

                expect(this.bobaFett.exhausted).toBeFalse();

                // Case 5 - when a friendly unit leaves play
                reset();
                this.player1.moveCard(this.rivalsFall, 'hand');
                this.player1.moveCard(this.deathStarStormtrooper, 'ground arena');

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
