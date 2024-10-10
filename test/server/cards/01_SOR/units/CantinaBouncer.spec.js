describe('Cantina Bouncer', function() {
    integration(function() {
        describe('Cantina Bouncer\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-bouncer'],
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                });
            });

            it('should allow player to return an non-leader unit to its owner\'s hand', function() {
                this.player1.clickCard(this.cantinaBouncer);
                expect(this.player1).toBeAbleToSelectExactly([this.viperProbeDroid, this.cantinaBouncer, this.wampa]);
                expect(this.player1).toHavePassAbilityButton();

                this.player1.clickCard(this.wampa);
                expect(this.wampa).toBeInLocation('hand');
            });
        });
    });
});
