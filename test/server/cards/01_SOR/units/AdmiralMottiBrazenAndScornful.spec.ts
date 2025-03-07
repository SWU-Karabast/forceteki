describe('Admiral Motti', function() {
    integration(function (contextRef) {
        describe('Admiral Motti\'s ability -', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['admiral-motti#brazen-and-scornful', 'superlaser-technician', { card: 'viper-probe-droid', exhausted: true }, { card: 'wampa', exhausted: true }],
                        spaceArena: [{ card: 'tieln-fighter', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'cell-block-guard', exhausted: true }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow player to ready an imperial unit', function() {
                const { context } = contextRef;

                // Attacks into cell block guard as the only valid attack
                context.player1.clickCard(context.admiralMotti);
                expect(context.player1).toHavePassAbilityButton();

                // This includes:
                // - Friendly units
                //   - Exhausted or ready
                // - Space or ground
                // - Enemy units
                // Excludes non-villainy units
                expect(context.player1).toBeAbleToSelectExactly([
                    context.superlaserTechnician,
                    context.viperProbeDroid,
                    context.tielnFighter,
                    context.cellBlockGuard
                ]);

                context.player1.clickCard(context.viperProbeDroid);

                expect(context.viperProbeDroid.exhausted).toBe(false);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be optional', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralMotti);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.superlaserTechnician,
                    context.viperProbeDroid,
                    context.tielnFighter,
                    context.cellBlockGuard
                ]);

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
