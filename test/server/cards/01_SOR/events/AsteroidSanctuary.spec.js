describe('Asteroid Sanctuary', function() {
    integration(function() {
        describe('Asteroid Sanctuary\'s ability -', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['asteroid-sanctuary'],
                        groundArena: ['viper-probe-droid', 'death-star-stormtrooper', 'wampa']
                    },
                    player2: {
                        groundArena: ['death-trooper', 'superlaser-technician']
                    }
                });
            });

            it('should exhaust an enemy unit and give a friendly unit that costs 3 or less a shield', function() {
                this.player1.clickCard(this.asteroidSanctuary);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.superlaserTechnician]);

                this.player1.clickCard(this.deathTrooper);
                expect(this.player1).toBeAbleToSelectExactly([this.viperProbeDroid, this.deathStarStormtrooper]);

                this.player1.clickCard(this.viperProbeDroid);
                expect(this.deathTrooper.exhausted).toBe(true);
                expect(this.viperProbeDroid).toHaveExactUpgradeNames(['shield']);

                expect(this.player2).toBeActivePlayer();
            });

            describe('when there are no friendly units,', function() {
                it('should allow player to exhaust an enemy unit', function() {
                    this.player1.setGroundArenaUnits([]);

                    this.player1.clickCard(this.asteroidSanctuary);
                    expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.superlaserTechnician]);

                    this.player1.clickCard(this.deathTrooper);
                    expect(this.deathTrooper.exhausted).toBe(true);

                    expect(this.player2).toBeActivePlayer();
                });
            });

            describe('when there are no enemy units,', function() {
                it('should allow player to give a friendly unit that costs 3 or less a shield', function() {
                    this.player2.setGroundArenaUnits([]);

                    this.player1.clickCard(this.asteroidSanctuary);
                    expect(this.player1).toBeAbleToSelectExactly([this.viperProbeDroid, this.deathStarStormtrooper]);

                    this.player1.clickCard(this.viperProbeDroid);
                    expect(this.viperProbeDroid).toHaveExactUpgradeNames(['shield']);

                    expect(this.player2).toBeActivePlayer();
                });
            });

            describe('when there are no targets,', function() {
                it('can be played to no effect', function() {
                    this.player1.setGroundArenaUnits([]);
                    this.player2.setGroundArenaUnits([]);

                    this.player1.clickCard(this.asteroidSanctuary);

                    expect(this.player2).toBeActivePlayer();
                });
            });
        });
    });
});
