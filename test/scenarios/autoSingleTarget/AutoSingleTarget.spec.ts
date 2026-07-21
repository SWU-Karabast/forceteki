describe('autoSingleTarget: single-target scenarios', function() {
    integration(function(contextRef) {
        // When the opponent is the one choosing the target, autoSingleTarget must be keyed off the
        // *choosing* player's setting, not the ability controller's.
        describe('when the opponent chooses the only available target', function() {
            it('auto-resolves when the choosing opponent has autoSingleTarget on, even if the controller has it off', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: false,
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        autoSingleTarget: true,
                        groundArena: ['fleet-lieutenant']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.powerOfTheDarkSide);

                // opponent's single unit is defeated automatically with no selection prompt
                expect(context.fleetLieutenant).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('still prompts when the choosing opponent has autoSingleTarget off, even if the controller has it on', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        autoSingleTarget: true,
                        hand: ['power-of-the-dark-side']
                    },
                    player2: {
                        autoSingleTarget: false,
                        groundArena: ['fleet-lieutenant']
                    }
                });
                const { context } = contextRef;

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
