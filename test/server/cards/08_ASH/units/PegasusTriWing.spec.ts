describe('Pegasus Tri-Wing', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pegasus-triwing'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['jedi-lightsaber', { card: 'top-target', ownerAndController: 'player2' }] }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: [{ card: 'entrenched', ownerAndController: 'player1' }] }],
                    }
                });
            });

            it('should allow defeating a friendly upgrade to ready Pegasus Tri-Wing', function() {
                const { context } = contextRef;

                // Play Pegasus Tri-Wing, trigger When Played ability
                context.player1.clickCard(context.pegasusTriwing);

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade. If you do, ready this unit');
                expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.entrenched]);
                expect(context.player1).toHavePassAbilityButton();

                // Defeat a firendly upgrade, ready Pegasus Tri-Wing
                context.player1.clickCard(context.jediLightsaber);

                expect(context.pegasusTriwing.exhausted).toBeFalse();
                expect(context.jediLightsaber).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow defeating a friendly upgrade on an enemy unit to ready Pegasus Tri-Wing', function() {
                const { context } = contextRef;

                // Play Pegasus Tri-Wing, trigger When Played ability
                context.player1.clickCard(context.pegasusTriwing);

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade. If you do, ready this unit');
                expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.entrenched]);
                expect(context.player1).toHavePassAbilityButton();

                // Defeat a firendly upgrade, ready Pegasus Tri-Wing
                context.player1.clickCard(context.entrenched);

                expect(context.pegasusTriwing.exhausted).toBeFalse();
                expect(context.entrenched).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not ready Pegasus Tri-Wing if no friendly upgrade is defeated', function() {
                const { context } = contextRef;

                // Play Pegasus Tri-Wing, trigger When Played ability
                context.player1.clickCard(context.pegasusTriwing);

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade. If you do, ready this unit');
                expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.entrenched]);
                expect(context.player1).toHavePassAbilityButton();

                // Pass on defeating a friendly upgrade, do not ready Pegasus Tri-Wing
                context.player1.clickPrompt('Pass');

                expect(context.pegasusTriwing.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});