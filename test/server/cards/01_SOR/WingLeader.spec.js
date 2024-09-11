describe('Wing Leader', function() {
    integration(function() {
        describe('Wing Leader\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wing-leader'],
                        groundArena: ['21b-surgical-droid', 'fleet-lieutenant', { card: 'rebel-pathfinder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['viper-probe-droid']
                    }
                });
            });

            it('can give two experience to a unit', function () {
                this.player1.clickCard(this.wingLeader);
                expect(this.player1).toBeAbleToSelectExactly([this.fleetLieutenant, this.rebelPathfinder]);
                this.player1.clickCard(this.fleetLieutenant);

                expect(this.fleetLieutenant.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience']);
            });

            it('can give two experience to a unit that already has an experience', function () {
                this.player1.clickCard(this.wingLeader);
                expect(this.player1).toBeAbleToSelectExactly([this.fleetLieutenant, this.rebelPathfinder]);
                this.player1.clickCard(this.rebelPathfinder);

                expect(this.rebelPathfinder.upgrades.map((upgrade) => upgrade.internalName)).toEqual(['experience', 'experience', 'experience']);
            });
        });
    });
});
