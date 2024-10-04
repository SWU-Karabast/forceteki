describe('Admiral Motti', function() {
    integration(function () {
        describe('Admiral Motti\'s ability -', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['admiral-motti#brazen-and-scornful', 'superlaser-technician', { card: 'viper-probe-droid', exhausted: true }, { card: 'wampa', exhausted: true }],
                        spaceArena: [{ card: 'tieln-fighter', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'cell-block-guard', exhausted: true }]
                    }
                });
            });

            it('should allow player to ready an imperial unit', function() {
                // Attacks into cell block guard as the only valid attack
                this.player1.clickCard(this.admiralMotti);

                // This includes:
                // - Friendly units
                //   - Exhausted or ready
                // - Space or ground
                // - Enemy units
                // Excludes non-villainy units
                expect(this.player1).toBeAbleToSelectExactly([
                    this.superlaserTechnician,
                    this.viperProbeDroid,
                    this.tielnFighter,
                    this.cellBlockGuard
                ]);

                this.player1.clickCard(this.viperProbeDroid);

                expect(this.viperProbeDroid.exhausted).toBe(false);

                expect(this.player2).toBeActivePlayer();
            });

            it('should be optional', function () {
                this.player1.clickCard(this.admiralMotti);

                expect(this.player1).toBeAbleToSelectExactly([
                    this.superlaserTechnician,
                    this.viperProbeDroid,
                    this.tielnFighter,
                    this.cellBlockGuard
                ]);

                this.player1.clickPrompt('Pass ability');

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
