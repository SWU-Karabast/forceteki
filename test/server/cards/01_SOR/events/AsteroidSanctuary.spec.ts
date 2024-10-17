describe('Asteroid Sanctuary', function() {
    integration(function(contextRef) {
        describe('Asteroid Sanctuary\'s ability -', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.asteroidSanctuary);
                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.superlaserTechnician]);

                context.player1.clickCard(context.deathTrooper);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.deathStarStormtrooper]);

                context.player1.clickCard(context.viperProbeDroid);
                expect(context.deathTrooper.exhausted).toBe(true);
                expect(context.viperProbeDroid).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });

            describe('when there are no friendly units,', function() {
                it('should allow player to exhaust an enemy unit', function() {
                    const { context } = contextRef;

                    context.player1.setGroundArenaUnits([]);

                    context.player1.clickCard(context.asteroidSanctuary);
                    expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.superlaserTechnician]);

                    context.player1.clickCard(context.deathTrooper);
                    expect(context.deathTrooper.exhausted).toBe(true);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no enemy units,', function() {
                it('should allow player to give a friendly unit that costs 3 or less a shield', function() {
                    const { context } = contextRef;

                    context.player2.setGroundArenaUnits([]);

                    context.player1.clickCard(context.asteroidSanctuary);
                    expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.deathStarStormtrooper]);

                    context.player1.clickCard(context.viperProbeDroid);
                    expect(context.viperProbeDroid).toHaveExactUpgradeNames(['shield']);

                    expect(context.player2).toBeActivePlayer();
                });
            });

            describe('when there are no targets,', function() {
                it('can be played to no effect', function() {
                    const { context } = contextRef;

                    context.player1.setGroundArenaUnits([]);
                    context.player2.setGroundArenaUnits([]);

                    context.player1.clickCard(context.asteroidSanctuary);

                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});
