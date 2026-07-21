describe('Power of the Dark Side', function() {
    integration(function(contextRef) {
        describe('Power of the Dark Side\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                    },
                    player2: {
                        groundArena: ['fleet-lieutenant'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('forces opponent to defeat friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeAbleToSelectExactly([context.fleetLieutenant, context.sabineWren]);

                context.player2.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('discard');
                expect(context.sabineWren.deployed).toBeTrue();
            });
        });

        describe('Power of the Dark Side\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('forces opponent to defeat a leader unit if nothing else is available', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.sabineWren.deployed).toBeFalse();
            });
        });

        // Regression: when the opponent is the one choosing the target, autoSingleTarget must be keyed
        // off the *choosing* player's setting (the opponent), not the ability controller's setting.
        describe('when the opponent chooses the only available target', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        groundArena: ['fleet-lieutenant']
                    }
                });
            });

            it('auto-resolves when the choosing opponent has autoSingleTarget on, even if the controller has it off', function () {
                const { context } = contextRef;

                context.player1Object.optionSettings.autoSingleTarget = false;
                context.player2Object.optionSettings.autoSingleTarget = true;

                context.player1.clickCard(context.powerOfTheDarkSide);

                // opponent's single unit is defeated automatically with no selection prompt
                expect(context.fleetLieutenant).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('still prompts when the choosing opponent has autoSingleTarget off, even if the controller has it on', function () {
                const { context } = contextRef;

                context.player1Object.optionSettings.autoSingleTarget = true;
                context.player2Object.optionSettings.autoSingleTarget = false;

                context.player1.clickCard(context.powerOfTheDarkSide);

                // opponent must still be prompted to choose their single unit
                expect(context.fleetLieutenant).toBeInZone('groundArena');
                expect(context.player2).toBeAbleToSelectExactly([context.fleetLieutenant]);

                context.player2.clickCard(context.fleetLieutenant);
                expect(context.fleetLieutenant).toBeInZone('discard');
            });
        });
    });
});
