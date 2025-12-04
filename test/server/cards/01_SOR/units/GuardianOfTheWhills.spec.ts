describe('Guardian of the Whills', function () {
    integration(function (contextRef) {
        describe('Guardian of the Whills\' cost reduction ability', function () {
            it('should reduce the cost of the first upgrade played on it each turn by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['constructed-lightsaber', 'jedi-lightsaber'],
                        groundArena: ['guardian-of-the-whills'],
                    }
                });

                const { context } = contextRef;

                // Play Constructed Lightsaber on Guardian
                context.player1.clickCard(context.constructedLightsaber);
                context.player1.clickCard(context.guardianOfTheWhills);

                // Check that the cost was reduced by 1
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['constructed-lightsaber']);

                // Move to next action phase to verify the ability resets
                context.moveToNextActionPhase();

                // Play Jedi Lightsaber on Guardian
                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.guardianOfTheWhills);

                // Check that the cost was reduced by 1 again
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['constructed-lightsaber', 'jedi-lightsaber']);
            });

            it('should not reduce the cost of subsequent upgrades played on it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['constructed-lightsaber', 'jedi-lightsaber', 'devotion'],
                        groundArena: ['guardian-of-the-whills'],
                    }
                });

                const { context } = contextRef;

                // Play Constructed Lightsaber on Guardian
                context.player1.clickCard(context.constructedLightsaber);
                context.player1.clickCard(context.guardianOfTheWhills);

                // Check that the cost was reduced by 1
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['constructed-lightsaber']);
                context.player2.passAction();

                // Play Jedi Lightsaber on Guardian
                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.guardianOfTheWhills);

                // Check that the cost was not reduced
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['constructed-lightsaber', 'jedi-lightsaber']);
                context.player2.passAction();

                // Play Devotion on Guardian
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.guardianOfTheWhills);

                // Check that the cost was not reduced
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['constructed-lightsaber', 'jedi-lightsaber', 'devotion']);
            });

            it('should not reduce the cost of upgrades played on other friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['constructed-lightsaber'],
                        groundArena: ['guardian-of-the-whills', 'jedi-guardian']
                    }
                });

                const { context } = contextRef;

                // Play Constructed Lightsaber on Jedi Guardian
                context.player1.clickCard(context.constructedLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.jediGuardian]);
                context.player1.clickCard(context.jediGuardian);

                // Check that the cost was not reduced
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.jediGuardian).toHaveExactUpgradeNames(['constructed-lightsaber']);
            });

            it('should not reduce the cost of upgrades played on enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['constructed-lightsaber'],
                        groundArena: ['guardian-of-the-whills'],
                    },
                    player2: {
                        groundArena: ['witch-of-the-mist']
                    }
                });

                const { context } = contextRef;

                // Play Constructed Lightsaber on Witch of the Mist
                context.player1.clickCard(context.constructedLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.guardianOfTheWhills, context.witchOfTheMist]);
                context.player1.clickCard(context.witchOfTheMist);

                // Check that the cost was not reduced
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.witchOfTheMist).toHaveExactUpgradeNames(['constructed-lightsaber']);
            });

            it('should not be able to play the upgrade on a different unit if costs cannot be paid', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['constructed-lightsaber'],
                        resources: 2,
                        groundArena: ['guardian-of-the-whills', 'jedi-guardian']
                    }
                });

                const { context } = contextRef;

                // Constructed Lightsaber should be selectable since it can be played on Guardian of the Whills with cost reduction
                expect(context.player1).toBeAbleToSelect(context.constructedLightsaber);
                context.player1.clickCard(context.constructedLightsaber);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.guardianOfTheWhills,
                    // TODO: Jedi Guardian should not even be selectable in this scenario
                    // https://github.com/SWU-Karabast/forceteki/issues/1970
                    context.jediGuardian
                ]);

                context.player1.clickCard(context.jediGuardian);

                // Action is cancelled because player cannot pay full cost
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.jediGuardian).toHaveExactUpgradeNames([]);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
